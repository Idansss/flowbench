import Link from "next/link";
import {
  FileSpreadsheet,
  Receipt,
  ImageIcon,
  Users,
  Video,
  Share2,
  QrCode,
  Mail,
  Workflow,
  FileText,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tools = [
  {
    id: "excel-fix-it",
    name: "Excel Fix It Bot",
    slug: "excel-fix-it",
    description: "Clean and normalize spreadsheets with deduplication, formatting, and validation",
    icon: FileSpreadsheet,
    category: "data",
  },
  {
    id: "invoice-extractor",
    name: "Invoice & Receipt Extractor",
    slug: "invoice-extractor",
    description: "Extract structured data from invoices and receipts",
    icon: Receipt,
    category: "documents",
  },
  {
    id: "image-studio",
    name: "Bulk Image Studio",
    slug: "image-studio",
    description: "Background removal, resizing, and batch conversion",
    icon: ImageIcon,
    category: "media",
  },
  {
    id: "lead-scrubber",
    name: "Clipboard Lead Scrubber",
    slug: "lead-scrubber",
    description: "Clean and validate contact lists with smart normalization",
    icon: Users,
    category: "data",
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts Generator",
    slug: "youtube-shorts",
    description: "Create captions, hooks, and tags for short-form videos",
    icon: Video,
    category: "content",
  },
  {
    id: "blog-atomizer",
    name: "Blog to Social Atomizer",
    slug: "blog-atomizer",
    description: "Convert blog posts into social media content",
    icon: Share2,
    category: "content",
  },
  {
    id: "qr-generator",
    name: "Bulk QR Generator",
    slug: "qr-generator",
    description: "Create QR codes for events with custom templates",
    icon: QrCode,
    category: "media",
  },
  {
    id: "email-templater",
    name: "Email Templater",
    slug: "email-templater",
    description: "Generate personalized cold outreach emails",
    icon: Mail,
    category: "content",
  },
  {
    id: "sheets-automation",
    name: "Sheets Automations",
    slug: "sheets-automation",
    description: "Rule-based spreadsheet operations and transformations",
    icon: Workflow,
    category: "data",
  },
  {
    id: "pdf-filler",
    name: "Web Form to PDF Filler",
    slug: "pdf-filler",
    description: "Fill PDF forms programmatically",
    icon: FileText,
    category: "documents",
  },
];

const categories = {
  data: "Data Processing",
  documents: "Documents",
  media: "Media",
  content: "Content Generation",
};

export default function HomePage() {
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Free Micro Tools Suite
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Automate common marketplace tasks. Upload, process, download. No
          paywalls, no upsells, no lock-in.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="#tools">Browse Tools</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/docs">Documentation</Link>
          </Button>
        </div>
      </section>

      {/* Idansss AI Feature */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/20 rounded-full">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Meet Idansss AI</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for Flowbench. Get instant tool recommendations,
          troubleshooting help, and workflow optimization powered by GPT-4 and Gemini.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Button asChild size="lg">
            <Link href="/ai">Try Idansss AI</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Always Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hidden costs, no premium tiers, no credit card required.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Privacy First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Files auto-delete after 24 hours. No data retention by default.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Full Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every operation is logged. Download complete audit reports.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="space-y-8">
        <h2 className="text-3xl font-bold">Available Tools</h2>

        {Object.entries(toolsByCategory).map(([categoryKey, categoryTools]) => (
          <div key={categoryKey} className="space-y-4">
            <h3 className="text-xl font-semibold text-muted-foreground">
              {categories[categoryKey as keyof typeof categories]}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <CardDescription className="mt-2">
                            {tool.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link href={`/tools/${tool.slug}`}>
                          Open Tool
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

