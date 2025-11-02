import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TelemetryToggle } from "@/components/ui/telemetry-toggle";
import { Download, Trash2, Shield, Clock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and privacy preferences
        </p>
      </div>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <Clock className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Control how long your files are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-accent rounded">
              <div>
                <p className="font-medium">Default Retention</p>
                <p className="text-sm text-muted-foreground">
                  Files auto-delete after 24 hours
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Extended Retention</p>
                <p className="text-sm text-muted-foreground">
                  Keep files for 7 days (requires sign-in)
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/signin">Sign In to Enable</a>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            All files are permanently deleted after retention period. Job metadata
            is kept for 30 days.
          </p>
        </CardContent>
      </Card>

      {/* Privacy & Telemetry */}
      <TelemetryToggle />

      {/* Data Export */}
      <Card>
        <CardHeader>
          <Download className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download all your job history and files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export includes: job history, configuration presets, file metadata,
            and audit logs in JSON format.
          </p>

          <form action="/api/user/export" method="GET">
            <Button type="submit" variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Note: Requires sign-in. Anonymous users don't have persistent data to
            export.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <Trash2 className="w-8 h-8 text-destructive mb-2" />
          <CardTitle>Delete All Data</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded space-y-2">
            <p className="font-medium text-destructive">
              This action cannot be undone!
            </p>
            <p className="text-sm">
              This will permanently delete:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Your account</li>
              <li>• All uploaded files</li>
              <li>• All job history</li>
              <li>• All audit logs</li>
              <li>• All saved presets</li>
            </ul>
          </div>

          <form action="/api/user/delete" method="POST">
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              onClick={(e) => {
                if (
                  !confirm(
                    "Are you absolutely sure? This cannot be undone and all your data will be permanently deleted."
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All My Data
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Note: Requires sign-in. This action is immediate and irreversible.
          </p>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <Shield className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Your Privacy Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Access: View all your jobs anytime</p>
          <p>✓ Export: Download your complete data as JSON</p>
          <p>✓ Delete: Permanently erase all your data</p>
          <p>✓ Control: Manage telemetry and retention settings</p>
          <p>✓ Transparency: Full audit trail for every operation</p>

          <div className="pt-4">
            <Button variant="link" asChild className="p-0 h-auto">
              <a href="/privacy">Read Full Privacy Policy →</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

