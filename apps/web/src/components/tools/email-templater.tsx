"use client";

import { useState } from "react";
import { Mail, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  persona: string;
  tone: string;
  objective: string;
  seed: number;
}

export function EmailTemplaterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    persona: "sales representative",
    tone: "professional",
    objective: "schedule a demo",
    seed: 42,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a CSV file with leads",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/email-templater", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Templates generated!",
        description: `Created mail merge for ${data.summary.leads} leads`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
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
      icon={Mail}
      title="Email Templater"
      description="Generate personalized cold outreach emails"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "text/csv": [".csv"],
          }}
          maxSize={50 * 1024 * 1024}
          label="Upload Lead List"
          description="CSV with leads and context"
        />
      }
      optionsPanel={
        <>
          <div className="space-y-2">
            <Label htmlFor="persona">Persona</Label>
            <Select
              value={options.persona}
              onValueChange={(value) =>
                setOptions({ ...options, persona: value })
              }
            >
              <SelectTrigger id="persona">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales representative">Sales Rep</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="marketer">Marketer</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={options.tone}
              onValueChange={(value) =>
                setOptions({ ...options, tone: value })
              }
            >
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Input
              id="objective"
              placeholder="e.g., schedule a demo"
              value={options.objective}
              onChange={(e) =>
                setOptions({ ...options, objective: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed">Seed</Label>
            <Input
              id="seed"
              type="number"
              value={options.seed}
              onChange={(e) =>
                setOptions({ ...options, seed: parseInt(e.target.value) || 42 })
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
                Generating...
              </>
            ) : (
              "Generate Templates"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Email templates will appear here
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Leads:</div>
                <div className="font-medium">{result.summary.leads}</div>
                <div className="text-muted-foreground">Tokens used:</div>
                <div className="font-medium">{result.summary.tokensUsed}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Templates
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Bundle includes:</p>
              <ul className="list-disc list-inside ml-2">
                <li>email-template.json</li>
                <li>mail-merge.csv</li>
                <li>audit.json</li>
              </ul>
            </div>

            {result.auditSteps && (
              <AuditViewer steps={result.auditSteps} className="mt-4" />
            )}
          </>
        )
      }
    />
  );
}
