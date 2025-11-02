# Sample Files for Testing

This directory contains sample files for testing each Flowbench tool.

## Available Samples

### Excel Fix It Bot
- `sample-data.csv` - Messy contact list with duplicates, whitespace, inconsistent casing

### Lead Scrubber  
- `sample-data.csv` - Same file, tests email validation and normalization

### Invoice & Receipt Extractor
- `sample-invoice.txt` - Sample invoice with structured data to extract

### QR Generator
- `sample-qr-data.csv` - Event attendee list for bulk QR code generation

### Email Templater
- `sample-email-leads.csv` - Lead list with context for personalized emails

### YouTube Shorts Generator
- `sample-youtube-transcript.txt` - Video transcript for content generation

### Blog to Social Atomizer
- `sample-blog.html` - Blog article to convert into social posts

## Usage

1. **Test Locally:**
   ```bash
   # Copy file to your desktop for easy uploading
   copy infra\samples\sample-data.csv C:\Users\Admin\Desktop\
   ```

2. **In the App:**
   - Go to http://localhost:3000
   - Click on any tool
   - Upload the corresponding sample file
   - Click "Run"
   - Download results!

## Creating Your Own Samples

### CSV Files
- Include headers in first row
- Add intentional "messy" data (duplicates, spaces, mixed case)
- Test edge cases (empty cells, special characters)

### Invoice Files
- Include common patterns (Invoice #, Date, Total)
- Test different formats and layouts
- Add line items if possible

### Images
- Use various formats (JPG, PNG, WebP)
- Include different sizes
- Test with batch uploads

## Golden File Tests

To create golden file tests:

1. Process a sample file through the tool
2. Verify the output is correct
3. Save it as `expected-output-{tool}.csv`
4. Use in automated tests to ensure consistency

## Need More Samples?

Create an issue on GitHub requesting specific sample files!

