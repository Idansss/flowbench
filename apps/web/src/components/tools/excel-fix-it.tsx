"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  dedupeRows: boolean;
  trimWhitespace: boolean;
  normalizeCase: "none" | "lower" | "upper" | "title";
  fixDates: boolean;
  removeEmptyRows: boolean;
}

export function ExcelFixItTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    dedupeRows: true,
    trimWhitespace: true,
    normalizeCase: "none",
    fixDates: true,
    removeEmptyRows: true,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one CSV or Excel file",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/excel-fix-it", {
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
        description: `Processed ${data.summary.rowsProcessed} rows`,
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

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.location.href = result.downloadUrl;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Excel Fix It Bot</h1>
          <p className="text-muted-foreground">
            Clean and normalize spreadsheets with deduplication, formatting, and validation
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Upload CSV or Excel files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onFilesSelected={handleFilesSelected}
              selectedFiles={files}
              onRemoveFile={handleRemoveFile}
              accept={{
                "text/csv": [".csv"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
              }}
              maxSize={50 * 1024 * 1024}
              multiple
            />
          </CardContent>
        </Card>

        {/* Options Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Configure processing rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dedupe">Deduplicate rows</Label>
              <Switch
                id="dedupe"
                checked={options.dedupeRows}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, dedupeRows: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="trim">Trim whitespace</Label>
              <Switch
                id="trim"
                checked={options.trimWhitespace}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, trimWhitespace: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="case">Normalize case</Label>
              <Select
                value={options.normalizeCase}
                onValueChange={(value: any) =>
                  setOptions({ ...options, normalizeCase: value })
                }
              >
                <SelectTrigger id="case">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lower">Lowercase</SelectItem>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dates">Fix dates to ISO</Label>
              <Switch
                id="dates"
                checked={options.fixDates}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, fixDates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empty">Remove empty rows</Label>
              <Switch
                id="empty"
                checked={options.removeEmptyRows}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, removeEmptyRows: checked })
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
                  Processing...
                </>
              ) : (
                "Run"
              )}
            </Button>

            {processing && <Progress value={progress} />}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Download cleaned files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                Results will appear here after processing
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Rows processed:</div>
                    <div className="font-medium">{result.summary.rowsProcessed}</div>
                    <div className="text-muted-foreground">Duplicates removed:</div>
                    <div className="font-medium">{result.summary.duplicatesRemoved}</div>
                    <div className="text-muted-foreground">Empty rows removed:</div>
                    <div className="font-medium">{result.summary.emptyRowsRemoved}</div>
                    <div className="text-muted-foreground">Output rows:</div>
                    <div className="font-medium">{result.summary.outputRows}</div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Cleaned File
                </Button>

                {result.auditSteps && (
                  <AuditViewer steps={result.auditSteps} className="mt-4" />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

