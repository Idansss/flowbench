import { notFound } from "next/navigation";
import { tools } from "@/config";
import { ExcelFixItTool } from "@/components/tools/excel-fix-it";
import { InvoiceExtractorTool } from "@/components/tools/invoice-extractor";
import { ImageStudioTool } from "@/components/tools/image-studio";
import { LeadScrubberTool } from "@/components/tools/lead-scrubber";
import { YoutubeShortsTool } from "@/components/tools/youtube-shorts";
import { BlogAtomizerTool } from "@/components/tools/blog-atomizer";
import { QRGeneratorTool } from "@/components/tools/qr-generator";
import { EmailTemplaterTool } from "@/components/tools/email-templater";
import { SheetsAutomationTool } from "@/components/tools/sheets-automation";
import { PDFFillerTool } from "@/components/tools/pdf-filler";

const toolComponents: Record<string, React.ComponentType> = {
  "excel-fix-it": ExcelFixItTool,
  "invoice-extractor": InvoiceExtractorTool,
  "image-studio": ImageStudioTool,
  "lead-scrubber": LeadScrubberTool,
  "youtube-shorts": YoutubeShortsTool,
  "blog-atomizer": BlogAtomizerTool,
  "qr-generator": QRGeneratorTool,
  "email-templater": EmailTemplaterTool,
  "sheets-automation": SheetsAutomationTool,
  "pdf-filler": PDFFillerTool,
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const ToolComponent = toolComponents[tool.slug];

  if (!ToolComponent) {
    notFound();
  }

  return <ToolComponent />;
}
