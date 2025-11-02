# Flowbench Deployment Guide

Complete guide to deploying Flowbench to production.

## Prerequisites

- Vercel account
- Supabase account (or AWS S3 for storage)
- PostgreSQL database (Supabase, Railway, Neon, etc.)
- OpenAI API key (for content generation tools)
- SMTP server (for email magic links)

## Environment Variables

Create these environment variables in your deployment platform:

### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/flowbench

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# File Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Email (for magic links)
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@your-domain.com
```

### Optional

```bash
# OpenAI (for content tools)
OPENAI_API_KEY=sk-xxx

# Observability
ENABLE_SENTRY=true
SENTRY_DSN=https://xxx@sentry.io/xxx

ENABLE_POSTHOG=true
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Configuration
FILE_SIZE_LIMIT_MB=50
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_USER=500
FILE_RETENTION_HOURS=24

# Cron
CRON_SECRET=<generate-random-secret>
```

## Deployment Steps

### 1. Database Setup

If using Supabase:

```bash
# Create a new Supabase project
# Go to SQL Editor and run the schema

cat infra/database/schema.sql | \
  psql "postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres"
```

If using another PostgreSQL provider:

```bash
# Run migrations
pnpm db:migrate
```

### 2. Supabase Storage Bucket

Create a storage bucket named `flowbench`:

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `flowbench`
3. Set to **Public** (files have expiring signed URLs)
4. Set CORS policy:

```json
{
  "allowedOrigins": ["https://your-domain.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAge": 3600
}
```

### 3. Deploy to Vercel

#### Option A: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

#### Option B: CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... (add all required env vars)
```

### 4. Configure Domain

1. Add custom domain in Vercel
2. Update DNS records as instructed
3. Update `NEXTAUTH_URL` to production domain
4. Redeploy

### 5. Set Up Cron Jobs

Vercel automatically sets up cron jobs from `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Add `CRON_SECRET` environment variable for authentication.

### 6. Post-Deployment Checks

```bash
# Health check
curl https://your-domain.com

# Test tool
curl -X POST https://your-domain.com/api/tools/excel-fix-it \
  -F "files=@sample.csv" \
  -F 'config={"dedupeRows":true}'

# Test cron (with your CRON_SECRET)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/cleanup
```

## Monitoring

### Application Logs

View logs in Vercel Dashboard → Deployments → [Your Deployment] → Logs

### Database Monitoring

```sql
-- Active jobs
SELECT status, COUNT(*) 
FROM jobs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Storage usage
SELECT 
  SUM(size_bytes) / 1024 / 1024 / 1024 as gb_used,
  COUNT(*) as file_count
FROM files 
WHERE deleted_at IS NULL;

-- Top tools by usage
SELECT tool_id, COUNT(*) as job_count
FROM jobs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tool_id
ORDER BY job_count DESC;
```

### Sentry Setup (Optional)

1. Create Sentry project
2. Add `SENTRY_DSN` environment variable
3. Set `ENABLE_SENTRY=true`
4. Install Sentry SDK:

```bash
cd apps/web
pnpm add @sentry/nextjs
```

Initialize in `apps/web/instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.ENABLE_SENTRY === 'true') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}
```

### PostHog Setup (Optional)

1. Create PostHog project
2. Add environment variables
3. Initialize in `apps/web/src/app/layout.tsx`:

```typescript
import { PostHogProvider } from 'posthog-js/react'

// In layout component
{process.env.ENABLE_POSTHOG === 'true' && (
  <PostHogProvider
    apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
    options={{ api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST }}
  >
    {children}
  </PostHogProvider>
)}
```

## Scaling Considerations

### Current Limits

- 50MB file uploads
- 100k rows per CSV
- 200 images per batch
- 60s processing timeout

### Scaling Options

#### 1. Increase Vercel Limits

Upgrade to Vercel Pro for:
- Longer function timeouts (5min)
- More memory (3GB)
- Higher concurrency

#### 2. Add Background Workers

For long-running jobs, add a worker service:

```typescript
// packages/workers/src/index.ts
import { runJob } from './job-runner'

export default {
  async queue(batch: MessageBatch, env: Env) {
    for (const message of batch.messages) {
      await runJob(message.body.jobId)
    }
  }
}
```

Deploy to Cloudflare Workers or Railway.

#### 3. Database Optimization

Add indexes for common queries:

```sql
CREATE INDEX CONCURRENTLY idx_jobs_user_status 
ON jobs(user_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_files_job_type 
ON files(job_id, file_type) 
WHERE deleted_at IS NULL;
```

#### 4. CDN for Static Assets

Serve output files through CDN:
- Cloudflare R2
- AWS CloudFront + S3
- Vercel Edge Network (automatic)

## Backup Strategy

### Database Backups

If using Supabase: automatic daily backups (retain 7 days)

If self-hosted:

```bash
# Daily backup script
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup-*.sql.gz s3://your-backup-bucket/
```

### Storage Backups

Files auto-delete after 24h-7d, so backups not critical.

For compliance, enable versioning in Supabase Storage.

## Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] File size limits enforced
- [ ] Content security policy set
- [ ] Cron endpoint secured with secret
- [ ] Database connection uses SSL
- [ ] Secrets stored in environment, not code

## Cost Estimation

### Free Tier (Small Usage)

- Vercel Hobby: $0
- Supabase Free: $0 (500MB DB, 1GB storage, 2GB transfer)
- Total: **$0/month**

### Production (Medium Usage)

- Vercel Pro: $20/month
- Supabase Pro: $25/month (8GB DB, 100GB storage)
- OpenAI API: ~$10/month (if using content tools)
- Total: **~$55/month**

### Scale (High Usage)

- Vercel Enterprise: $150/month
- Supabase Team: $599/month (or self-hosted $0)
- OpenAI API: ~$50/month
- CDN/Storage: ~$50/month
- Total: **~$850/month**

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@your-domain.com

## License

MIT - See LICENSE file

