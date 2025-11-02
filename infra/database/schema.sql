-- Flowbench Database Schema
-- PostgreSQL 14+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  is_anonymous BOOLEAN DEFAULT FALSE,
  telemetry_opt_in BOOLEAN DEFAULT FALSE,
  extended_retention BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Tools table (reference data)
CREATE TABLE tools (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert tools
INSERT INTO tools (id, name, slug, description, category) VALUES
  ('excel-fix-it', 'Excel Fix It Bot', 'excel-fix-it', 'Clean and normalize spreadsheets', 'data'),
  ('invoice-extractor', 'Invoice & Receipt Extractor', 'invoice-extractor', 'Extract structured data from invoices', 'documents'),
  ('image-studio', 'Bulk Image Studio', 'image-studio', 'Background removal and batch resize', 'media'),
  ('lead-scrubber', 'Clipboard Lead Scrubber', 'lead-scrubber', 'Clean and validate contact lists', 'data'),
  ('youtube-shorts', 'YouTube Shorts Generator', 'youtube-shorts', 'Create captions and hooks', 'content'),
  ('blog-atomizer', 'Blog to Social Atomizer', 'blog-atomizer', 'Convert articles to social posts', 'content'),
  ('qr-generator', 'Bulk QR Generator', 'qr-generator', 'Create QR codes for events', 'media'),
  ('email-templater', 'Email Templater', 'email-templater', 'Cold outreach templates', 'content'),
  ('sheets-automation', 'Sheets Automations', 'sheets-automation', 'Rule-based operations', 'data'),
  ('pdf-filler', 'Web Form to PDF Filler', 'pdf-filler', 'Fill PDF forms programmatically', 'documents');

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(50) NOT NULL REFERENCES tools(id),
  status VARCHAR(20) NOT NULL DEFAULT 'created',
  -- Status: created, running, succeeded, failed, cancelled
  input_config JSONB,
  result_summary JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_tool_id ON jobs(tool_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC) WHERE deleted_at IS NULL;

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  file_type VARCHAR(20) NOT NULL,
  -- Type: input, output, audit
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT NOT NULL,
  checksum VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_files_job_id ON files(job_id);
CREATE INDEX idx_files_created_at ON files(created_at);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  input_summary JSONB,
  output_summary JSONB,
  warnings JSONB,
  counts JSONB,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_job_id ON audit_logs(job_id, step_number);

-- Presets table
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(50) NOT NULL REFERENCES tools(id),
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_presets_user_tool ON presets(user_id, tool_id) WHERE deleted_at IS NULL;

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier VARCHAR(255) NOT NULL,
  -- IP address or user ID
  identifier_type VARCHAR(20) NOT NULL,
  -- Type: ip, user
  endpoint VARCHAR(100) NOT NULL,
  request_count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, identifier_type, window_end);
CREATE INDEX idx_rate_limits_window_end ON rate_limits(window_end);

-- Sessions table (for anonymous sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old files and jobs
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Mark files for deletion based on retention policy
  UPDATE files
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '24 hours'
    AND job_id IN (
      SELECT j.id FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE u.extended_retention = FALSE OR u.extended_retention IS NULL
    );

  -- Mark files for deletion with extended retention
  UPDATE files
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '7 days'
    AND job_id IN (
      SELECT j.id FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE u.extended_retention = TRUE
    );

  -- Mark old jobs for soft delete
  UPDATE jobs
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '30 days';

  -- Clean up expired rate limit records
  DELETE FROM rate_limits
  WHERE window_end < NOW() - INTERVAL '24 hours';

  -- Clean up expired sessions
  DELETE FROM sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts, supporting both authenticated and anonymous sessions';
COMMENT ON TABLE jobs IS 'Job execution records with lifecycle tracking';
COMMENT ON TABLE files IS 'File storage metadata with retention policy support';
COMMENT ON TABLE audit_logs IS 'Detailed step-by-step audit trail for each job';
COMMENT ON TABLE presets IS 'User-saved configuration presets per tool';
COMMENT ON TABLE rate_limits IS 'Rate limiting tracking per IP and user';

