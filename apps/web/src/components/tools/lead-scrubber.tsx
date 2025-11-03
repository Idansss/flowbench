"use client";

import { useState } from "react";
import { Users, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  normalizeNames: boolean;
  validateEmails: boolean;
  inferDomains: boolean;
  dedupeByEmail: boolean;
}

export function LeadScrubberTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    normalizeNames: true,
    validateEmails: true,
    inferDomains: true,
    dedupeByEmail: true,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/lead-scrubber", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Processing complete!",
        description: `Cleaned ${data.summary.outputRows} leads`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <ToolLayout
      icon={Users}
      title="Clipboard Lead Scrubber"
      description="Clean and validate contact lists with smart normalization"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "text/csv": [".csv"],
          }}
          maxSize={50 * 1024 * 1024}
          label="Upload CSV"
          description="Contact list with email, name, company"
        />
      }
      optionsPanel={
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="normalize-names">Normalize names</Label>
            <Switch
              id="normalize-names"
              checked={options.normalizeNames}
              onCheckedChange={(checked) =>
                setOptions({ ...options, normalizeNames: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="validate-emails">Validate emails</Label>
            <Switch
              id="validate-emails"
              checked={options.validateEmails}
              onCheckedChange={(checked) =>
                setOptions({ ...options, validateEmails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="infer-domains">Infer company domains</Label>
            <Switch
              id="infer-domains"
              checked={options.inferDomains}
              onCheckedChange={(checked) =>
                setOptions({ ...options, inferDomains: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dedupe">Deduplicate by email</Label>
            <Switch
              id="dedupe"
              checked={options.dedupeByEmail}
              onCheckedChange={(checked) =>
                setOptions({ ...options, dedupeByEmail: checked })
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleProcess}
            disabled={files.length === 0 || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cleaning...
              </>
            ) : (
              "Clean Leads"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Results will appear here after processing
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Total rows:</div>
                <div className="font-medium">{result.summary.totalRows}</div>
                <div className="text-muted-foreground">Output rows:</div>
                <div className="font-medium">{result.summary.outputRows}</div>
                <div className="text-muted-foreground">Names normalized:</div>
                <div className="font-medium">{result.summary.names_normalized}</div>
                <div className="text-muted-foreground">Emails validated:</div>
                <div className="font-medium">{result.summary.emails_validated}</div>
                <div className="text-muted-foreground">Duplicates removed:</div>
                <div className="font-medium">{result.summary.duplicates_removed}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Cleaned Leads
            </Button>

            {result.auditSteps && (
              <AuditViewer steps={result.auditSteps} className="mt-4" />
            )}
          </>
        )
      }
    />
  );
}
