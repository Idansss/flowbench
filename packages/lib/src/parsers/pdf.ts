// PDF parsing utilities
// Using pdf-parse for text extraction

export interface PDFData {
  text: string;
  pages: {
    pageNumber: number;
    text: string;
  }[];
  meta: {
    pageCount: number;
    title?: string;
    author?: string;
    creationDate?: Date;
  };
}

/**
 * Parse PDF file and extract text
 * Note: pdf-parse needs to be imported dynamically to avoid build issues
 */
export async function parsePDF(file: File | Buffer): Promise<PDFData> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfParse = (await import("pdf-parse")).default;
    
    let buffer: Buffer;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    const pdfData = await pdfParse(buffer);

    return {
      text: pdfData.text,
      pages: Array.from({ length: pdfData.numpages }, (_, i) => ({
        pageNumber: i + 1,
        text: "", // pdf-parse doesn't split by page easily
      })),
      meta: {
        pageCount: pdfData.numpages,
        title: pdfData.info?.Title,
        author: pdfData.info?.Author,
        creationDate: pdfData.info?.CreationDate
          ? new Date(pdfData.info.CreationDate)
          : undefined,
      },
    };
  } catch (error) {
    throw new Error(
      `PDF parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export function extractInvoiceData(pdfText: string): {
  vendor?: string;
  invoiceNumber?: string;
  date?: string;
  total?: number;
  currency?: string;
  tax?: number;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
} {
  // Deterministic regex-based extraction
  const result: any = {};

  // Vendor patterns - look for company name near top
  const vendorPatterns = [
    /^([A-Z][A-Za-z\s&,.']+(?:Inc|LLC|Corp|Ltd|Co))/m,
    /^([A-Z][A-Za-z\s&,.']{3,40})\n/m,
  ];

  for (const pattern of vendorPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      result.vendor = match[1].trim();
      break;
    }
  }

  // Invoice number patterns
  const invoiceNumberPatterns = [
    /invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /inv(?:oice)?\s*(?:number|no|#)\s*:?\s*([A-Z0-9-]+)/i,
    /(?:invoice|bill)\s*#\s*([A-Z0-9-]+)/i,
  ];

  for (const pattern of invoiceNumberPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      result.invoiceNumber = match[1];
      break;
    }
  }

  // Date patterns
  const datePatterns = [
    /(?:date|issued|invoice date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  ];

  for (const pattern of datePatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      result.date = match[1];
      break;
    }
  }

  // Currency detection
  if (/\$/.test(pdfText)) {
    result.currency = "USD";
  } else if (/€/.test(pdfText)) {
    result.currency = "EUR";
  } else if (/£/.test(pdfText)) {
    result.currency = "GBP";
  } else {
    result.currency = "USD";
  }

  // Total patterns
  const totalPatterns = [
    /total\s*(?:amount|due)?\s*:?\s*\$?\s*([\d,]+\.?\d{0,2})/i,
    /amount\s*due\s*:?\s*\$?\s*([\d,]+\.?\d{0,2})/i,
    /grand\s*total\s*:?\s*\$?\s*([\d,]+\.?\d{0,2})/i,
  ];

  for (const pattern of totalPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      result.total = parseFloat(match[1].replace(/,/g, ""));
      break;
    }
  }

  // Tax patterns
  const taxPatterns = [
    /tax\s*(?:\(\d+%\))?\s*:?\s*\$?\s*([\d,]+\.?\d{0,2})/i,
    /vat\s*:?\s*\$?\s*([\d,]+\.?\d{0,2})/i,
  ];

  for (const pattern of taxPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      result.tax = parseFloat(match[1].replace(/,/g, ""));
      break;
    }
  }

  // Line items extraction (simplified)
  const lineItems: any[] = [];
  
  // Look for table-like structures
  const linePattern = /(.{3,50})\s+(\d+)\s+\$?([\d,]+\.?\d{0,2})\s+\$?([\d,]+\.?\d{0,2})/g;
  let lineMatch;

  while ((lineMatch = linePattern.exec(pdfText)) !== null) {
    const [, description, quantity, unitPrice, amount] = lineMatch;
    
    lineItems.push({
      description: description.trim(),
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice.replace(/,/g, "")),
      amount: parseFloat(amount.replace(/,/g, "")),
    });
  }

  if (lineItems.length > 0) {
    result.lineItems = lineItems;
  }

  return result;
}
