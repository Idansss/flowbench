# Flowbench TODO - Remaining Work

## Status Summary
✅ **Completed:** Infrastructure, UI components, Excel Fix It Bot (full), 9 tool UIs
🚧 **In Progress:** Backend implementation for remaining tools
⏳ **Pending:** Full integration, testing, documentation

---

## Priority 1: Core Backend Implementation

### 1.1 API Routes for 9 Tools
**Location:** `apps/web/src/app/api/tools/`

- [ ] **Invoice Extractor** (`invoice-extractor/route.ts`)
  - Implement PDF parsing with pdf-parse
  - Regex-based extraction (vendor, invoice#, date, total)
  - OCR fallback for images
  - Generate invoice.csv + line_items.csv
  - 95%+ accuracy on samples

- [ ] **Image Studio** (`image-studio/route.ts`)
  - Integrate sharp for resizing/conversion
  - Background removal (rembg or similar)
  - Batch processing (200 images)
  - Generate ZIP with naming scheme

- [ ] **Lead Scrubber** (`lead-scrubber/route.ts`)
  - Email validation using lib/validation/email
  - Name normalization
  - Domain inference (public suffix rules)
  - Dedupe by email
  - <10s for 10k rows

- [ ] **YouTube Shorts** (`youtube-shorts/route.ts`)
  - OpenAI integration
  - Generate 10 hooks, 3 captions, 20 tags, 1 thumbnail prompt
  - Deterministic (seed parameter)
  - Temperature 0.2

- [ ] **Blog Atomizer** (`blog-atomizer/route.ts`)
  - Fetch and parse blog URL
  - Strip boilerplate, keep code blocks
  - OpenAI content generation
  - Output: tweets, LinkedIn, IG, carousel outline

- [ ] **QR Generator** (`qr-generator/route.ts`)
  - Generate QR codes with qrcode library
  - Template support
  - Logo overlay
  - Printable sheet + individual PNGs
  - Signed payload option

- [ ] **Email Templater** (`email-templater/route.ts`)
  - OpenAI integration
  - Persona/tone/objective options
  - Mail merge tokens
  - Validate token names exist in CSV

- [ ] **Sheets Automation** (`sheets-automation/route.ts`)
  - Safe expression language parser
  - Label/move rows by rule
  - Weekly rollup summary
  - Rule documentation in UI

- [ ] **PDF Filler** (`pdf-filler/route.ts`)
  - Form builder UI
  - PDF template upload
  - Field positioning
  - Flatten PDF output
  - RTL text support

### 1.2 Enhance Excel Fix It Bot
**Location:** `apps/web/src/app/api/tools/excel-fix-it/route.ts`

- [ ] ISO date normalization (line 41)
- [ ] Split column by delimiter
- [ ] Merge columns with template
- [ ] Handle XLSX (not just CSV)
- [ ] Stream progress for large files

---

## Priority 2: Job Lifecycle & Database Integration

### 2.1 Job Persistence
**Location:** `apps/web/src/lib/job-runner.ts`

- [ ] Wire `db.createJob()` on tool submission
- [ ] Call `runJob(jobId)` for processing
- [ ] Update job status (running → succeeded/failed)
- [ ] Store result summaries

### 2.2 File Management
**Location:** `apps/web/src/lib/storage.ts`, `apps/web/src/lib/db.ts`

- [ ] Upload input files to Supabase/S3
- [ ] Track files in database
- [ ] Generate output files
- [ ] Create ZIP bundles with audit.json
- [ ] Provide download endpoints

### 2.3 Audit Logging
**Location:** `apps/web/src/lib/db.ts` (line 203)

- [ ] Write audit logs for each step
- [ ] Include counts, warnings, duration
- [ ] Redact PII in logs
- [ ] Generate audit.json in bundle

---

## Priority 3: Shared UI Components

### 3.1 Tool Layout Template
**Location:** `apps/web/src/components/tools/`

- [ ] Create `ToolLayout` component
- [ ] Three-panel design: Input | Options | Results
- [ ] Apply to all 9 remaining tools
- [ ] Consistent styling and behavior

### 3.2 Progress & Results
**Location:** `apps/web/src/components/ui/`

- [ ] Real-time progress bars
- [ ] Audit viewer integration
- [ ] Download button with ZIP
- [ ] Error state handling

---

## Priority 4: User Features

### 4.1 Preset Management
**Location:** `apps/web/src/lib/db.ts` (line 233)

- [ ] Create preset save UI
- [ ] Load preset on tool page
- [ ] Delete preset option
- [ ] Default preset marking

### 4.2 Job History Dashboard
**Location:** `apps/web/src/app/dashboard/page.tsx` (new)

- [ ] List user's recent jobs
- [ ] Job status badges
- [ ] Re-download results
- [ ] Re-run with same config

### 4.3 User Data Export/Delete
**Location:** `apps/web/src/app/api/user/` (new)

- [ ] `/api/user/export` - Download all data as JSON
- [ ] `/api/user/delete` - Delete account & files
- [ ] UI page for data management
- [ ] Match privacy policy promises

---

## Priority 5: Security & Privacy

### 5.1 File Scanning
**Location:** `apps/web/src/lib/upload.ts` (new)

- [ ] Content-type validation
- [ ] Executable file blocking (.exe, .sh, .bat)
- [ ] Magic number checking
- [ ] Size limit enforcement

### 5.2 Rate Limiting
**Location:** `apps/web/src/middleware.ts` (new)

- [ ] IP-based rate limiting
- [ ] User-based rate limiting
- [ ] Use existing `db.checkRateLimit()`
- [ ] Return 429 with retry-after

### 5.3 Data Retention & Cleanup
**Location:** `apps/web/src/app/api/cron/cleanup/route.ts`

- [ ] Delete files from storage (not just DB)
- [ ] Respect 24h/7d retention settings
- [ ] Clean up orphaned records
- [ ] Log cleanup operations

---

## Priority 6: Observability & Config

### 6.1 Sentry Integration
**Location:** `apps/web/src/lib/observability.ts`

- [ ] Install @sentry/nextjs
- [ ] Initialize in instrumentation.ts
- [ ] Env-guarded (ENABLE_SENTRY)
- [ ] Capture exceptions in API routes

### 6.2 PostHog Integration
**Location:** `apps/web/src/app/layout.tsx`

- [ ] Install posthog-js
- [ ] Initialize PostHogProvider
- [ ] Env-guarded (ENABLE_POSTHOG)
- [ ] Track tool usage events

### 6.3 Telemetry Opt-In
**Location:** `apps/web/src/components/ui/telemetry-toggle.tsx`

- [ ] Mount toggle in settings/profile page
- [ ] Persist preference to database
- [ ] Respect opt-out in tracking
- [ ] Export telemetry data on request

### 6.4 Feature Flags
**Location:** `apps/web/src/config/index.ts`

- [ ] Anonymous sessions (already coded)
- [ ] Extended retention toggle
- [ ] Tool-specific flags
- [ ] Admin override capability

---

## Priority 7: Testing

### 7.1 Unit Tests
**Location:** `apps/web/tests/unit/` (new)

- [ ] CSV parser tests
- [ ] Excel parser tests
- [ ] Email validator tests
- [ ] Text utility tests
- [ ] Date normalization tests

### 7.2 Golden File Tests
**Location:** `apps/web/tests/golden/` (new)

- [ ] Excel: input → expected output
- [ ] Lead Scrubber: messy → clean
- [ ] Invoice: PDF → structured data
- [ ] Compare actual vs expected

### 7.3 E2E Tests (Playwright)
**Location:** `apps/web/tests/e2e/`

- [ ] Excel Fix It: upload → download flow
- [ ] Invoice Extractor: PDF → CSV
- [ ] Image Studio: upload → ZIP
- [ ] Lead Scrubber: CSV → cleaned CSV
- [ ] YouTube Shorts: URL → content
- [ ] 2 flows per tool (success + error)

### 7.4 Contract Tests
**Location:** `apps/web/tests/contract/` (new)

- [ ] API route input validation
- [ ] API route output schemas
- [ ] Zod schema checks
- [ ] Error response formats

### 7.5 CI Integration
**Location:** `.github/workflows/ci.yml`

- [ ] Run unit tests
- [ ] Run E2E tests (with test DB)
- [ ] Check test coverage
- [ ] Fail on <80% coverage

---

## Priority 8: Documentation

### 8.1 Tool READMEs
**Location:** `docs/tools/` (create)

- [ ] excel-fix-it.md (with screenshots)
- [ ] invoice-extractor.md
- [ ] image-studio.md
- [ ] lead-scrubber.md
- [ ] youtube-shorts.md
- [ ] blog-atomizer.md
- [ ] qr-generator.md
- [ ] email-templater.md
- [ ] sheets-automation.md
- [ ] pdf-filler.md

### 8.2 Sample Files
**Location:** `infra/samples/`

- [ ] sample-invoice.pdf
- [ ] sample-receipt.jpg
- [ ] sample-images.zip (10-20 images)
- [ ] sample-leads.csv (existing ✓)
- [ ] sample-youtube-transcript.txt
- [ ] sample-blog.html
- [ ] sample-qr-data.csv
- [ ] sample-email-leads.csv
- [ ] sample-sheet.csv
- [ ] sample-pdf-template.pdf

### 8.3 Demo Media
**Location:** `docs/demos/` (create)

- [ ] GIF/video for each tool
- [ ] Before/after screenshots
- [ ] Upload to public bucket
- [ ] Link from docs

### 8.4 API Documentation
**Location:** `docs/api.md`

- [ ] Document all endpoints
- [ ] Request/response examples
- [ ] Error codes and meanings
- [ ] Rate limit details

---

## Priority 9: Deployment Readiness

### 9.1 Database Migration
**Location:** `infra/database/migrate.ts`

- [ ] Test migration script
- [ ] Add rollback capability
- [ ] Version tracking
- [ ] Backup before migrate

### 9.2 Environment Setup
**Location:** Apps/web/.env.example

- [ ] Complete all required vars
- [ ] Add production values guide
- [ ] Document optional vars
- [ ] Security best practices

### 9.3 Vercel Configuration
**Location:** `vercel.json`

- [ ] Edge function configs
- [ ] Cron job schedules
- [ ] Environment variables
- [ ] Domain settings

### 9.4 Monitoring Setup
**Location:** Various

- [ ] Health check endpoint
- [ ] Database connection monitoring
- [ ] Error rate alerts
- [ ] Performance metrics

---

## Estimated Effort

| Priority | Tasks | Est. Hours | Status |
|----------|-------|------------|--------|
| P1: Backend | 9 tools + Excel enhancements | 40-60h | 🚧 |
| P2: Database | Job lifecycle + files | 12-16h | ⏳ |
| P3: UI | Shared components | 8-12h | ⏳ |
| P4: Features | Presets + history + export | 10-14h | ⏳ |
| P5: Security | Scanning + rate limit + cleanup | 8-12h | ⏳ |
| P6: Observability | Sentry + PostHog + config | 6-8h | ⏳ |
| P7: Testing | Unit + E2E + golden + contract | 20-30h | ⏳ |
| P8: Documentation | READMEs + samples + demos | 12-16h | ⏳ |
| P9: Deployment | Migration + config + monitoring | 6-10h | ⏳ |
| **TOTAL** | | **122-178h** | **~3-4 weeks** |

---

## Quick Wins (Do These First)

1. ✅ **Lead Scrubber API** - Simpler logic, uses existing validators
2. ✅ **QR Generator API** - Straightforward qrcode library integration
3. ✅ **Shared Tool Layout** - Apply to all tools for consistency
4. ✅ **Sample Files** - Quick to create, enables testing
5. ✅ **Rate Limiting Middleware** - Uses existing DB helpers

---

## Ready to Start?

**Suggested Order:**
1. Lead Scrubber + QR Generator (quick wins)
2. Job lifecycle + database integration (foundation)
3. Shared UI components (DRY up tool pages)
4. Remaining tool APIs (biggest chunk)
5. Testing + documentation (validate everything)
6. Security + observability (production ready)

**Let me know which priority you'd like to tackle first!** 🚀

