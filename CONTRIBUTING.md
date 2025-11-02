# Contributing to Flowbench

Thank you for your interest in contributing to Flowbench! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/flowbench.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running Locally

```bash
# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build
```

### Database Setup

```bash
# Run migrations
pnpm db:migrate

# Seed sample data
pnpm db:seed
```

## Project Structure

```
flowbench/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities and database
│       │   └── config/   # Configuration
├── packages/
│   ├── ui/               # Shared UI components
│   └── lib/              # Shared utilities
├── infra/
│   ├── database/         # Schema and migrations
│   └── samples/          # Sample files
└── docs/                 # Documentation
```

## Adding a New Tool

1. **Define the tool** in `apps/web/src/config/index.ts`

2. **Create the UI component** in `apps/web/src/components/tools/your-tool.tsx`

3. **Create the API route** in `apps/web/src/app/api/tools/your-tool/route.ts`

4. **Add tests** in `apps/web/tests/e2e/your-tool.spec.ts`

5. **Create documentation** in `docs/tools/your-tool.md`

### Tool Component Template

```tsx
"use client";

import { useState } from "react";
import { YourIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function YourToolComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      
      const response = await fetch("/api/tools/your-tool", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tool UI */}
    </div>
  );
}
```

### API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    // Process files
    const auditSteps = [];
    
    // Return results
    return NextResponse.json({
      success: true,
      summary: {},
      auditSteps,
      downloadUrl: "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

## Code Style

- Use TypeScript for all code
- Follow existing code patterns
- Use Prettier for formatting (runs on commit)
- Use ESLint rules (configured in project)
- Write meaningful commit messages

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(tools): add PDF merger tool

Implement PDF merging functionality with drag-and-drop reordering.
Includes unit tests and documentation.

Closes #123
```

## Testing

### Unit Tests

Place unit tests next to the code being tested:
```
src/lib/utils.ts
src/lib/utils.test.ts
```

### E2E Tests

Use Playwright for end-to-end tests:
```
tests/e2e/your-tool.spec.ts
```

Run tests:
```bash
pnpm test:e2e
```

### Golden File Tests

For tools that generate files, include golden file tests:
```
tests/golden/your-tool/input.csv
tests/golden/your-tool/expected-output.csv
```

## Documentation

- Update README.md for major changes
- Add tool documentation to `docs/tools/`
- Update API docs if adding new endpoints
- Include JSDoc comments for complex functions

## Pull Request Process

1. **Create a PR** with a clear title and description
2. **Link issues** using "Closes #123" syntax
3. **Add tests** for new functionality
4. **Update docs** as needed
5. **Ensure CI passes** (lint, typecheck, tests, build)
6. **Request review** from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Accessibility checked (keyboard, screen reader)
- [ ] Mobile responsive
- [ ] Performance acceptable

## Performance Guidelines

- Tools must handle stated limits (e.g., 100k rows)
- Provide progress feedback for long operations
- Use streaming when possible
- Avoid blocking the main thread
- Test with realistic file sizes

## Security Guidelines

- Validate all user inputs
- Sanitize file uploads
- Never log sensitive data
- Use parameterized SQL queries
- Follow OWASP best practices

## Accessibility Guidelines

- All interactive elements keyboard accessible
- Provide ARIA labels where needed
- Test with screen reader
- Ensure color contrast meets WCAG AA
- Support prefers-reduced-motion

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues before creating new ones

Thank you for contributing to Flowbench!

