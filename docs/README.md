# Flowbench Documentation

Welcome to Flowbench, a free micro tools suite for automating common marketplace tasks.

## Table of Contents

- [Quick Start](#quick-start)
- [Tools](#tools)
- [Admin Operations](#admin-operations)
- [Privacy & Security](#privacy--security)
- [Responsible Use](#responsible-use)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Supabase account (for file storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flowbench.git
cd flowbench
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `.env.local` with your database and Supabase credentials.

4. Run database migrations:
```bash
pnpm db:migrate
```

5. Seed sample data (optional):
```bash
pnpm db:seed
```

6. Start the development server:
```bash
pnpm dev
```

Visit http://localhost:3000

## Tools

### 1. Excel Fix It Bot

**Purpose**: Clean and normalize spreadsheets

**Input**: CSV, XLSX files

**Operations**:
- Deduplicate exact rows
- Trim whitespace
- Normalize case (lower, upper, title)
- Fix dates to ISO format
- Remove empty rows

**Performance**: Handles 100k rows in under 60 seconds

[Full spec →](./tools/excel-fix-it.md)

### 2. Invoice & Receipt Extractor

**Purpose**: Extract structured data from invoices

**Input**: PDF invoices, image receipts

**Output**: CSV of invoices, CSV of line items, per-file JSON

**Accuracy**: 95%+ on sample dataset

[Full spec →](./tools/invoice-extractor.md)

### 3-10. Other Tools

See individual tool documentation in the `tools/` directory.

## Admin Operations

### Database Maintenance

Clean up old files and jobs:
```bash
psql $DATABASE_URL -c "SELECT cleanup_old_data();"
```

Run this daily via cron job or Vercel Cron.

### Monitoring

View recent jobs:
```sql
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 100;
```

Check storage usage:
```sql
SELECT 
  tool_id,
  COUNT(*) as job_count,
  SUM(size_bytes) as total_bytes
FROM jobs j
JOIN files f ON f.job_id = j.id
WHERE j.created_at > NOW() - INTERVAL '7 days'
GROUP BY tool_id;
```

### Rate Limiting

Current limits:
- Per IP: 100 requests/hour
- Per User: 500 requests/hour

Adjust in `.env`:
```
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_USER=500
```

## Privacy & Security

### Data Retention

**Default**: Files auto-delete after 24 hours

**Extended**: Users can opt into 7-day retention

**Implementation**: 
- Soft delete via `deleted_at` timestamp
- Cleanup runs daily
- Physical deletion happens immediately after soft delete

### PII Handling

- Email addresses are redacted in logs
- Uploaded files are never logged
- Audit trails summarize but don't capture raw data

### Security Measures

1. **File validation**: Size limits, type checks, content scanning
2. **Rate limiting**: Per-IP and per-user throttles
3. **Input sanitization**: All user inputs validated with Zod
4. **No executable storage**: Blocks .exe, .sh, .bat uploads

## Responsible Use

### Acceptable Use

✅ Process your own data
✅ Automate repetitive tasks
✅ Clean and validate datasets
✅ Generate content from your own inputs

### Prohibited Use

❌ Scraping third-party sites without permission
❌ Processing data you don't own
❌ Generating spam or malicious content
❌ Circumventing rate limits

### Content Policy

AI-generated content (YouTube, Blog, Email tools) follows these rules:

- Temperature set to 0.2 for consistency
- System prompts checked into repo (no hidden instructions)
- Outputs are suggestions, not final copy
- User responsible for reviewing all generated content

### Data Export & Deletion

Users can:
- Download all their job history as JSON
- Request immediate deletion via `/api/user/delete`
- Opt out of telemetry at any time

## API Reference

All tools expose a common API pattern:

```typescript
POST /api/tools/{tool-slug}

// Request
FormData {
  files: File[]
  config: JSON
}

// Response
{
  success: boolean
  summary: Record<string, any>
  auditSteps: AuditStep[]
  downloadUrl: string
  error?: string
}
```

See [API documentation](./api.md) for details.

## Deployment

### Vercel

```bash
vercel deploy --prod
```

Environment variables required:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Migrations

On first deploy, run migrations:
```bash
pnpm --filter web db:migrate
```

### Cron Jobs

Set up daily cleanup:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 2 * * *"
  }]
}
```

## Contributing

This is an open-source project under MIT license. Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a PR

## Support

- Issues: https://github.com/yourusername/flowbench/issues
- Docs: https://flowbench.app/docs
- Privacy: https://flowbench.app/privacy

## License

MIT License - see [LICENSE](../LICENSE) file

