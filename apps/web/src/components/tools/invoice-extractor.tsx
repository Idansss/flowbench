"use client";

import { useState } from "react";
import { Receipt, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  extractLineItems: boolean;
  strictValidation: boolean;
}

export function InvoiceExtractorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    extractLineItems: true,
    strictValidation: false,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select invoice PDFs or receipt images",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 90));
      }, 300);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/invoice-extractor", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Extraction failed");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Extraction complete!",
        description: `Extracted ${data.summary.invoicesExtracted} invoices`,
      });
    } catch (error) {
      toast({
        title: "Extraction failed",
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
      icon={Receipt}
      title="Invoice & Receipt Extractor"
      description="Extract structured data from invoices and receipts"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "application/pdf": [".pdf"],
            "image/*": [".jpg", ".jpeg", ".png"],
            "application/zip": [".zip"],
          }}
          maxSize={50 * 1024 * 1024}
          multiple
          label="Upload Invoices"
          description="PDF, images, or ZIP archive"
        />
      }
      optionsPanel={
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="line-items">Extract line items</Label>
            <Switch
              id="line-items"
              checked={options.extractLineItems}
              onCheckedChange={(checked) =>
                setOptions({ ...options, extractLineItems: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="strict">Strict validation</Label>
            <Switch
              id="strict"
              checked={options.strictValidation}
              onCheckedChange={(checked) =>
                setOptions({ ...options, strictValidation: checked })
              }
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Extracted fields:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>Vendor name</li>
              <li>Invoice number</li>
              <li>Date & total</li>
              <li>Currency & tax</li>
              <li>Line items (if enabled)</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handleProcess}
            disabled={files.length === 0 || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract Data"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Results will appear here after extraction
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Files processed:</div>
                <div className="font-medium">{result.summary.filesProcessed}</div>
                <div className="text-muted-foreground">Invoices extracted:</div>
                <div className="font-medium">{result.summary.invoicesExtracted}</div>
                <div className="text-muted-foreground">Line items:</div>
                <div className="font-medium">{result.summary.lineItems || 0}</div>
                <div className="text-muted-foreground">Accuracy:</div>
                <div className="font-medium">{result.summary.accuracy}%</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Extracted Data
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Bundle includes:</p>
              <ul className="list-disc list-inside ml-2">
                <li>invoices.csv</li>
                <li>line-items.csv</li>
                <li>per-file-data.json</li>
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
