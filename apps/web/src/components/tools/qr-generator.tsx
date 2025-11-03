"use client";

import { useState } from "react";
import { QrCode, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Options {
  errorCorrection: "L" | "M" | "Q" | "H";
  size: number;
  secret?: string;
}

export function QRGeneratorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    errorCorrection: "M",
    size: 300,
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

      const response = await fetch("/api/tools/qr-generator", {
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
        title: "QR codes generated!",
        description: `Created ${data.summary.qrCodesGenerated} QR codes`,
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
      icon={QrCode}
      title="Bulk QR Generator"
      description="Create QR codes for events with custom templates"
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
          description="Names and data for QR codes"
        />
      }
      optionsPanel={
        <>
          <div className="space-y-2">
            <Label htmlFor="error-correction">Error Correction</Label>
            <Select
              value={options.errorCorrection}
              onValueChange={(value: any) =>
                setOptions({ ...options, errorCorrection: value })
              }
            >
              <SelectTrigger id="error-correction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (~7%)</SelectItem>
                <SelectItem value="M">Medium (~15%)</SelectItem>
                <SelectItem value="Q">Quartile (~25%)</SelectItem>
                <SelectItem value="H">High (~30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">QR Code Size (px)</Label>
            <Input
              id="size"
              type="number"
              min="100"
              max="1000"
              value={options.size}
              onChange={(e) =>
                setOptions({ ...options, size: parseInt(e.target.value) || 300 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Signing Secret (Optional)</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Leave empty for unsigned"
              value={options.secret || ""}
              onChange={(e) =>
                setOptions({ ...options, secret: e.target.value || undefined })
              }
            />
            <p className="text-xs text-muted-foreground">
              Use for signed payloads and verification
            </p>
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
              "Generate QR Codes"
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
                <div className="text-muted-foreground">Total entries:</div>
                <div className="font-medium">{result.summary.totalEntries}</div>
                <div className="text-muted-foreground">QR codes:</div>
                <div className="font-medium">{result.summary.qrCodesGenerated}</div>
                <div className="text-muted-foreground">Failed:</div>
                <div className="font-medium">{result.summary.qrCodesFailed || 0}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download QR Codes (ZIP)
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Bundle includes:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Individual PNG files</li>
                <li>Verification tokens CSV</li>
                <li>Audit trail (audit.json)</li>
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
