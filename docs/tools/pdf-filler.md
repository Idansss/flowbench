# Web Form to PDF Filler

Fill PDF forms programmatically with precise field positioning and flattening.

## Features

- ✅ **Form field detection** - Auto-discover fillable fields
- ✅ **Bulk filling** - Fill multiple values
- ✅ **PDF flattening** - Make fields non-editable
- ✅ **Field types** - Text, checkbox, radio, dropdown
- ✅ **Font handling** - Automatic fallback
- ✅ **RTL support** - Right-to-left text (Arabic, Hebrew)

## Input Format

**PDF template** with form fields (created in Adobe Acrobat, PDFtk, etc.)

**Field data** via JSON configuration:
```json
{
  "fieldData": {
    "name": "John Doe",
    "email": "john@example.com",
    "date": "2024-11-02",
    "signature": "John Doe"
  }
}
```

## How It Works

### Step 1: Upload PDF Template
Upload a PDF with fillable form fields

### Step 2: Extract Fields
Tool automatically detects all fields:
```json
{
  "fields": [
    { "name": "name", "type": "PDFTextField" },
    { "name": "email", "type": "PDFTextField" },
    { "name": "date", "type": "PDFTextField" }
  ]
}
```

### Step 3: Provide Data
Send field values in config

### Step 4: Download Filled PDF
Get flattened PDF with all fields populated

## Configuration

```typescript
{
  fieldData: Record<string, string>;  // Field name → value mapping
  flatten: boolean;                    // Default: true (make non-editable)
  preserveFormFields: boolean;         // Keep fields editable
}
```

## Output Files

1. **{filename}_filled.pdf** - Filled and flattened PDF
2. **audit.json** - Processing log

## Use Cases

1. **Form automation** - Fill recurring forms
2. **Bulk applications** - Same form, different data
3. **Contract generation** - Templates with variable data
4. **Certificate creation** - Names from CSV → certificates
5. **Tax forms** - Programmatic form filling

## Advanced Features

### **Field Types Supported:**
- ✅ Text fields
- ✅ Checkboxes  
- ✅ Radio buttons
- ✅ Dropdowns
- ⏳ Signature fields (coming soon)

### **Font Handling:**
- Automatic font fallback
- Unicode character support
- RTL text rendering
- Custom font embedding (coming soon)

## API Endpoint

```bash
POST /api/tools/pdf-filler

# Request
{
  "files": [pdfTemplate],
  "config": {
    "fieldData": {
      "field1": "value1",
      "field2": "value2"
    },
    "flatten": true
  }
}
```

## Example Workflow

### 1. Create PDF Template
Use Adobe Acrobat or PDFtk to create form fields

### 2. Upload to Flowbench
Upload template PDF

### 3. Get Field Names
Tool returns available fields

### 4. Provide Data (via CSV or JSON)
Map values to field names

### 5. Download Result
Get filled, flattened PDF ready to use!

## Batch Processing

Upload CSV with multiple rows:
```csv
name,email,date
John Doe,john@example.com,2024-11-02
Jane Smith,jane@example.com,2024-11-03
```

Get multiple filled PDFs (one per row)!

## Sample Files

Coming soon - sample PDF templates for:
- Job application
- W-9 tax form
- Certificate template
- Contract template

## Acceptance Criteria

✅ Precise field positioning  
✅ Font fallback handling  
✅ RTL text support  
✅ PDF flattening  
✅ Form field metadata  

