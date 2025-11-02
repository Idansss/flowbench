# Flowbench - Free Micro Tools Suite

A free, web-based suite of small utilities that automate common marketplace gigs from Fiverr and Upwork.

## 🎯 Features

- **Excel Fix It Bot** - Clean and normalize spreadsheets
- **Invoice & Receipt Extractor** - Extract structured data from documents
- **Bulk Image Studio** - Background removal and batch resize
- **Clipboard Lead Scrubber** - Clean and validate contact lists
- **YouTube Shorts Generator** - Create captions and hooks
- **Blog to Social Atomizer** - Convert articles to social posts
- **Bulk QR Generator** - Create QR codes for events
- **Email Templater** - Cold outreach templates
- **Sheets Automations** - Rule-based spreadsheet operations
- **Web Form to PDF Filler** - Fill PDF forms programmatically

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# Run database migrations
pnpm db:migrate

# Seed sample data
pnpm db:seed

# Start development server
pnpm dev
```

Visit http://localhost:3000

## 🏗️ Project Structure

```
flowbench/
├── apps/
│   └── web/                    # Next.js application
├── packages/
│   ├── ui/                     # Shared UI components
│   └── lib/                    # Shared utilities
├── infra/
│   ├── database/               # Schema and migrations
│   └── samples/                # Sample files for testing
└── docs/                       # Documentation
```

## 📚 Documentation

See the [docs](./docs) folder for:
- Tool specifications
- API documentation
- Admin operations
- Responsible use guidelines

## 🔒 Privacy

- No paywalls or upsells
- Privacy by default
- Auto-delete files after 24 hours
- Clear audit trail for all operations

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

