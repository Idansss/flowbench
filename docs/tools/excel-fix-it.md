# Excel Fix It Bot

Clean and normalize spreadsheets with deduplication, formatting, and validation.

## Features

- ✅ **Deduplicate rows** - Remove exact duplicate entries
- ✅ **Trim whitespace** - Clean leading/trailing spaces
- ✅ **Normalize case** - Apply lowercase, UPPERCASE, or Title Case
- ✅ **Fix dates** - Convert to ISO 8601 format (YYYY-MM-DD)
- ✅ **Remove empty rows** - Delete rows with no data
- ✅ **Split columns** - Split by delimiter (comma, pipe, etc.)
- ✅ **Merge columns** - Combine with custom template

## Input Formats

- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)

**Maximum file size:** 50 MB  
**Maximum rows:** 100,000

## Performance

Processes at least **100,000 rows in under 60 seconds** on Vercel serverless.

## Example Usage

### Input CSV
```csv
name,email,company,notes
John Doe,john.doe@example.com,Acme Corp,"   Interested in demo   "
jane smith,JANE.SMITH@EXAMPLE.COM,Tech Inc,Follow up next week
John Doe,john.doe@example.com,Acme Corp,Interested in demo
```

### Options
- ✅ Deduplicate rows
- ✅ Trim whitespace
- ✅ Normalize case: Title Case
- ✅ Fix dates to ISO

### Output CSV
```csv
name,email,company,notes
John Doe,john.doe@example.com,Acme Corp,Interested in demo
Jane Smith,jane.smith@example.com,Tech Inc,Follow up next week
```

## Configuration Options

```typescript
{
  dedupeRows: boolean;          // Remove exact duplicates
  trimWhitespace: boolean;      // Trim all cells
  normalizeCase: "none" | "lower" | "upper" | "title";
  fixDates: boolean;            // Normalize to ISO 8601
  removeEmptyRows: boolean;     // Remove rows with no data
  splitColumn?: {               // Optional: split a column
    column: string;
    delimiter: string;
  };
  mergeColumns?: {              // Optional: merge columns
    columns: string[];
    template: string;           // e.g., "{firstName} {lastName}"
    targetColumn: string;
  };
}
```

## Output

- **Cleaned CSV file** - Processed data with applied transformations
- **audit.json** - Step-by-step processing log
- **results.zip** - Bundle containing both files

## Audit Trail Example

```json
[
  {
    "stepNumber": 1,
    "stepName": "Parse Input",
    "description": "Parsed sample.csv",
    "counts": {
      "rows": 1000,
      "columns": 5
    },
    "durationMs": 150
  },
  {
    "stepNumber": 2,
    "stepName": "Remove Empty Rows",
    "description": "Removed 10 empty rows",
    "counts": {
      "removed": 10,
      "remaining": 990
    },
    "durationMs": 50
  }
]
```

## API Endpoint

```bash
POST /api/tools/excel-fix-it

# Request
Content-Type: multipart/form-data
files: File[]
config: JSON

# Response
{
  "success": true,
  "jobId": "uuid",
  "downloadUrl": "https://...",
  "summary": {
    "rowsProcessed": 1000,
    "duplicatesRemoved": 50,
    "outputRows": 950
  },
  "auditSteps": [...]
}
```

## Common Use Cases

1. **Clean CRM exports** - Remove duplicates, normalize names
2. **Prepare data for import** - Standardize formats, fix dates
3. **Merge contact lists** - Deduplicate across multiple sources
4. **Normalize survey responses** - Consistent casing, trim whitespace

## Tips

- **Large files:** Upload may take time, be patient
- **Dates:** Supports common formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
- **Case normalization:** Use Title Case for names, Lower for emails
- **Split columns:** Great for "Full Name" → "First Name" + "Last Name"

## Limitations

- CSV/Excel only (no Google Sheets direct import)
- Max 100,000 rows per file
- Column operations apply to all rows
- Complex formulas not supported

## Screenshots

[Add screenshots here after deployment]

## Demo

[Add demo GIF/video here after deployment]

