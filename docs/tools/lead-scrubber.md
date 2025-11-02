# Clipboard Lead Scrubber

Clean and validate contact lists with smart normalization.

## Features

- ✅ **Email validation** - Syntax checking with detailed error messages
- ✅ **Name normalization** - Title case, trim whitespace
- ✅ **Domain inference** - Extract company domains (exclude free providers)
- ✅ **Deduplication** - Remove duplicate emails
- ✅ **Validation status** - Track which changes were made

## Input Format

CSV with contact data. Common columns:
- `name` - Contact name
- `email` - Email address
- `company` - Company name (optional)
- `phone` - Phone number (optional)

**Maximum:** 10,000 rows  
**Performance:** Under 10 seconds

## Example Usage

### Input CSV
```csv
name,email,company
  john doe  ,JOHN.DOE@EXAMPLE.COM,Acme
jane smith,invalid-email,TechCo
Bob,bob@gmail.com,
```

### Output CSV
```csv
name,email,company,company_domain,_validation_status
John Doe,john.doe@example.com,Acme,example.com,ok
Jane Smith,invalid-email,TechCo,,invalid_email
Bob,bob@gmail.com,,,ok
```

## Configuration

```typescript
{
  normalizeNames: boolean;      // Title case names
  validateEmails: boolean;      // Check email syntax
  inferDomains: boolean;        // Extract company domains
  dedupeByEmail: boolean;       // Remove duplicate emails
}
```

## Output

- **Cleaned CSV** - With validation status and inferred domains
- **audit.json** - Processing details
- **results.zip** - Complete bundle

## Validation Rules

### Email Validation
- ✅ Must have @ symbol
- ✅ Must have domain extension
- ✅ No special characters in username
- ✅ Normalized to lowercase

### Domain Inference
- ✅ Excludes: gmail.com, yahoo.com, hotmail.com, outlook.com
- ✅ Only returns corporate domains
- ✅ Uses public suffix rules

### Name Normalization
- ✅ Trims whitespace
- ✅ Converts to Title Case
- ✅ Handles multiple spaces

## API Endpoint

```bash
POST /api/tools/lead-scrubber
```

## Use Cases

1. **Clean CRM imports** - Validate before importing
2. **Merge contact lists** - Dedupe across sources
3. **Email campaign prep** - Ensure deliverability
4. **Lead scoring** - Identify corporate vs personal emails

## Acceptance Criteria

✅ Processes 10,000 rows in under 10 seconds  
✅ Accurate email syntax validation  
✅ Domain inference with public suffix filtering  
✅ Deduplication by normalized email  

## Sample File

See `infra/samples/sample-data.csv`

