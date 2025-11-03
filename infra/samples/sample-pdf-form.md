# Sample PDF Form for Testing

## PDF Filler Testing

The PDF Filler tool requires a PDF with fillable form fields.

### Creating a Test PDF Form:

**Option 1: Use Adobe Acrobat (If available)**
1. Open a Word document
2. Export as PDF
3. Open in Adobe Acrobat
4. Tools → Prepare Form
5. Add form fields (name, email, date, etc.)
6. Save

**Option 2: Use PDFescape (Free Online)**
1. Go to https://www.pdfescape.com
2. Upload any PDF
3. Click "Form" → "Form Field"
4. Add text fields
5. Download

**Option 3: Use LibreOffice (Free)**
1. Create document in LibreOffice Writer
2. Insert → Form Controls
3. Add text fields
4. Export as PDF

### Sample Form Structure:

Create a simple form with these fields:
- `name` - Full Name
- `email` - Email Address
- `phone` - Phone Number
- `date` - Date
- `company` - Company Name
- `title` - Job Title

### Test Configuration:

```json
{
  "fieldData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0100",
    "date": "2024-11-02",
    "company": "Acme Corp",
    "title": "Software Engineer"
  },
  "flatten": true
}
```

### Expected Result:

- PDF with all fields filled
- Flattened (non-editable)
- Ready to download

