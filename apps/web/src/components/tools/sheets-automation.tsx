"use client";

import { useState } from "react";
import { Workflow, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  recipe: "label" | "move" | "rollup";
}

export function SheetsAutomationTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    recipe: "label",
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

      const response = await fetch("/api/tools/sheets-automation", {
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
        title: "Automation complete!",
        description: `Processed ${data.summary.outputRows} rows`,
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
      icon={Workflow}
      title="Sheets Automations"
      description="Rule-based spreadsheet operations and transformations"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "text/csv": [".csv"],
          }}
          maxSize={50 * 1024 * 1024}
          label="Upload Spreadsheet"
          description="CSV file with your data"
        />
      }
      optionsPanel={
        <>
          <div className="space-y-2">
            <Label htmlFor="recipe">Automation Recipe</Label>
            <Select
              value={options.recipe}
              onValueChange={(value: any) =>
                setOptions({ ...options, recipe: value })
              }
            >
              <SelectTrigger id="recipe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="label">Label Rows by Rule</SelectItem>
                <SelectItem value="move">Move Rows to Categories</SelectItem>
                <SelectItem value="rollup">Weekly Rollup Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 p-3 bg-accent rounded">
            <p><strong>Recipe Guide:</strong></p>
            
            {options.recipe === "label" && (
              <p>Adds a _label column based on rules you define</p>
            )}
            {options.recipe === "move" && (
              <p>Adds a _category column to organize rows</p>
            )}
            {options.recipe === "rollup" && (
              <p>Creates summary with counts and totals</p>
            )}

            <p className="mt-2"><strong>Safe expression language:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>column == value</li>
              <li>amount {'>'} 100</li>
              <li>name contains John</li>
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
                Processing...
              </>
            ) : (
              "Apply Automation"
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
                <div className="text-muted-foreground">Recipe:</div>
                <div className="font-medium capitalize">{result.summary.recipe}</div>
                <div className="text-muted-foreground">Input rows:</div>
                <div className="font-medium">{result.summary.inputRows}</div>
                <div className="text-muted-foreground">Output rows:</div>
                <div className="font-medium">{result.summary.outputRows}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Result
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
