import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Book, Shield, Code, Database, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to know about using Flowbench
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Book className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Choose a tool from the homepage</li>
              <li>Upload your files or input data</li>
              <li>Configure options as needed</li>
              <li>Click Run and download results</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Privacy First</CardTitle>
            <CardDescription>Your data, your rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Files auto-delete after 24 hours</p>
            <p>✓ No hidden data retention</p>
            <p>✓ Full audit trail for every job</p>
            <p>✓ Anonymous usage supported</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Code className="w-8 h-8 text-primary mb-2" />
            <CardTitle>API Access</CardTitle>
            <CardDescription>Integrate with your workflow</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">All tools are accessible via REST API:</p>
            <code className="block bg-muted p-2 rounded text-xs">
              POST /api/tools/[tool-slug]
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Performance</CardTitle>
            <CardDescription>Built for speed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ 100k rows in &lt;60s</p>
            <p>✓ Batch processing up to 200 files</p>
            <p>✓ Streaming progress updates</p>
            <p>✓ Zero blocking UI</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Database className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Available Tools</CardTitle>
          <CardDescription>10 tools for common marketplace tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Data Processing</h3>
              <ul className="space-y-1 text-sm">
                <li>• Excel Fix It Bot</li>
                <li>• Clipboard Lead Scrubber</li>
                <li>• Sheets Automations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Documents</h3>
              <ul className="space-y-1 text-sm">
                <li>• Invoice & Receipt Extractor</li>
                <li>• Web Form to PDF Filler</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Media</h3>
              <ul className="space-y-1 text-sm">
                <li>• Bulk Image Studio</li>
                <li>• Bulk QR Generator</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Content Generation</h3>
              <ul className="space-y-1 text-sm">
                <li>• YouTube Shorts Generator</li>
                <li>• Blog to Social Atomizer</li>
                <li>• Email Templater</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsible Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Acceptable Use ✅</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Process your own data</li>
              <li>• Automate repetitive tasks</li>
              <li>• Clean and validate datasets</li>
              <li>• Generate content from your own inputs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Prohibited Use ❌</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Scraping third-party sites without permission</li>
              <li>• Processing data you don't own</li>
              <li>• Generating spam or malicious content</li>
              <li>• Circumventing rate limits</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Contact us or check out the full documentation on GitHub.</p>
        <Link href="/privacy" className="text-primary hover:underline">
          Read our Privacy Policy →
        </Link>
      </div>
    </div>
  );
}

