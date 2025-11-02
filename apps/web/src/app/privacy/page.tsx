import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: November 2, 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Commitment</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            Flowbench is built with privacy as a core principle. We believe in
            transparency, minimal data collection, and user control.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Uploaded Files</h3>
            <p className="text-sm text-muted-foreground">
              Files you upload are temporarily stored for processing. By default,
              all files are automatically deleted after 24 hours. Users can opt
              into extended 7-day retention for convenience.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Job Metadata</h3>
            <p className="text-sm text-muted-foreground">
              We store job execution records including tool used, configuration
              options, processing time, and summary statistics. These records do
              not include the actual contents of your files.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Audit Logs</h3>
            <p className="text-sm text-muted-foreground">
              Each job generates an audit trail showing transformation steps,
              counts, and warnings. PII (emails, names) is redacted from audit
              logs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Anonymous Usage (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              If you opt in, we collect anonymous analytics via PostHog to
              improve the product. This includes tool usage, errors, and
              performance metrics. No PII is collected.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data We Don't Collect</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ We don't read or analyze your file contents</li>
            <li>✓ We don't train AI models on your data</li>
            <li>✓ We don't sell or share your data with third parties</li>
            <li>✓ We don't track you across other websites</li>
            <li>✓ We don't require payment information (it's free!)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Files</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Default:</strong> 24 hours
                <br />
                <strong>Extended:</strong> 7 days (opt-in)
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Job Records</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Metadata:</strong> 30 days
                <br />
                <strong>Audit logs:</strong> 30 days
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Cleanup runs automatically daily at 2 AM UTC.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Access:</strong> View all jobs you've run
            </li>
            <li>
              <strong>Export:</strong> Download your job history as JSON
            </li>
            <li>
              <strong>Delete:</strong> Request immediate deletion of all your
              data
            </li>
            <li>
              <strong>Opt-out:</strong> Disable telemetry at any time
            </li>
            <li>
              <strong>Anonymous:</strong> Use tools without creating an account
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ HTTPS encryption for all data in transit</p>
          <p>✓ Encrypted storage via Supabase</p>
          <p>✓ Rate limiting to prevent abuse</p>
          <p>✓ File type and size validation</p>
          <p>✓ Content scanning for malicious files</p>
          <p>✓ No long-term storage of sensitive data</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Supabase (Storage & Database)</h3>
            <p className="text-sm text-muted-foreground">
              Files are stored on Supabase's secure infrastructure. They follow
              strict data protection standards.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">OpenAI (Content Tools Only)</h3>
            <p className="text-sm text-muted-foreground">
              YouTube, Blog, and Email tools use OpenAI's API for content
              generation. We include the opt-out header to prevent OpenAI from
              logging requests.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">PostHog (Optional Analytics)</h3>
            <p className="text-sm text-muted-foreground">
              If you opt in, anonymous usage data is sent to PostHog. No PII is
              included.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Usage Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Only 3 tools (YouTube Shorts, Blog Atomizer, Email Templater) use AI:
          </p>
          <ul className="space-y-1 ml-4 mt-2">
            <li>• Temperature set to 0.2 for deterministic outputs</li>
            <li>• System prompts checked into repository (transparent)</li>
            <li>• Seed parameter allows reproducible results</li>
            <li>• No AI decisions on financial data (invoices)</li>
            <li>• Token limits enforced to control costs</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            We may update this privacy policy from time to time. We will notify
            users of any material changes by posting the new policy on this page
            and updating the "Last updated" date.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            Questions about privacy?
            <br />
            Email: privacy@flowbench.app
            <br />
            GitHub: https://github.com/yourusername/flowbench/issues
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

