"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Options {
  flatten: boolean;
  fieldData: Record<string, string>;
}

export function PDFFillerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    flatten: true,
    fieldData: {},
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sampleFields, setSampleFields] = useState({
    name: "",
    email: "",
    date: "",
    company: "",
  });
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a PDF template",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify({
        ...options,
        fieldData: sampleFields,
      }));

      const response = await fetch("/api/tools/pdf-filler", {
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
        title: "PDF filled!",
        description: `Filled ${data.summary.fieldsFilled} form fields`,
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
      icon={FileText}
      title="Web Form to PDF Filler"
      description="Fill PDF forms programmatically"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "application/pdf": [".pdf"],
          }}
          maxSize={50 * 1024 * 1024}
          label="Upload PDF Template"
          description="PDF with fillable form fields"
        />
      }
      optionsPanel={
        <>
          <div className="space-y-3">
            <Label>Form Field Data</Label>
            
            <div className="space-y-2">
              <Input
                placeholder="Name"
                value={sampleFields.name}
                onChange={(e) =>
                  setSampleFields({ ...sampleFields, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={sampleFields.email}
                onChange={(e) =>
                  setSampleFields({ ...sampleFields, email: e.target.value })
                }
              />
              <Input
                placeholder="Date"
                value={sampleFields.date}
                onChange={(e) =>
                  setSampleFields({ ...sampleFields, date: e.target.value })
                }
              />
              <Input
                placeholder="Company"
                value={sampleFields.company}
                onChange={(e) =>
                  setSampleFields({ ...sampleFields, company: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="flatten">Flatten PDF (make non-editable)</Label>
            <Switch
              id="flatten"
              checked={options.flatten}
              onCheckedChange={(checked) =>
                setOptions({ ...options, flatten: checked })
              }
            />
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-accent rounded">
            <p>The tool will auto-detect form fields in your PDF template.</p>
          </div>

          <Button
            className="w-full"
            onClick={handleProcess}
            disabled={files.length === 0 || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Filling...
              </>
            ) : (
              "Fill PDF"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Filled PDF will appear here
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Total fields:</div>
                <div className="font-medium">{result.summary.totalFields}</div>
                <div className="text-muted-foreground">Fields filled:</div>
                <div className="font-medium">{result.summary.fieldsFilled}</div>
                <div className="text-muted-foreground">Flattened:</div>
                <div className="font-medium">{result.summary.flattened ? "Yes" : "No"}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Filled PDF
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
