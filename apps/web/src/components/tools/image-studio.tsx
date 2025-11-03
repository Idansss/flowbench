"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Options {
  removeBackground: boolean;
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    fit: "cover" | "contain" | "fill";
  };
  format: "webp" | "png" | "jpg";
  quality: number;
}

export function ImageStudioTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Options>({
    removeBackground: false,
    resize: {
      enabled: false,
      width: 1920,
      height: 1080,
      fit: "cover",
    },
    format: "webp",
    quality: 80,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 200) {
      toast({
        title: "Too many files",
        description: "Maximum 200 images per batch",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/image-studio", {
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
        description: `Processed ${data.summary.processed} images`,
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
      icon={ImageIcon}
      title="Bulk Image Studio"
      description="Background removal, resizing, and batch conversion"
      inputPanel={
        <Dropzone
          onFilesSelected={setFiles}
          selectedFiles={files}
          onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
          accept={{
            "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
            "application/zip": [".zip"],
          }}
          maxSize={50 * 1024 * 1024}
          multiple
          label="Upload Images"
          description="Images or ZIP archives (max 200)"
        />
      }
      optionsPanel={
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="remove-bg">Remove background</Label>
            <Switch
              id="remove-bg"
              checked={options.removeBackground}
              onCheckedChange={(checked) =>
                setOptions({ ...options, removeBackground: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="resize-enabled">Resize images</Label>
              <Switch
                id="resize-enabled"
                checked={options.resize.enabled}
                onCheckedChange={(checked) =>
                  setOptions({
                    ...options,
                    resize: { ...options.resize, enabled: checked },
                  })
                }
              />
            </div>

            {options.resize.enabled && (
              <div className="grid grid-cols-2 gap-2 pl-4">
                <div>
                  <Label htmlFor="width" className="text-xs">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={options.resize.width}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        resize: { ...options.resize, width: parseInt(e.target.value) || 1920 },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={options.resize.height}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        resize: { ...options.resize, height: parseInt(e.target.value) || 1080 },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Output format</Label>
            <Select
              value={options.format}
              onValueChange={(value: any) =>
                setOptions({ ...options, format: value })
              }
            >
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WebP (Recommended)</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Quality: {options.quality}%</Label>
            </div>
            <Input
              id="quality"
              type="range"
              min="1"
              max="100"
              value={options.quality}
              onChange={(e) =>
                setOptions({ ...options, quality: parseInt(e.target.value) })
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
              "Process Images"
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
                <div className="text-muted-foreground">Total images:</div>
                <div className="font-medium">{result.summary.totalImages}</div>
                <div className="text-muted-foreground">Processed:</div>
                <div className="font-medium">{result.summary.processed}</div>
                <div className="text-muted-foreground">Failed:</div>
                <div className="font-medium">{result.summary.failed || 0}</div>
                <div className="text-muted-foreground">Format:</div>
                <div className="font-medium">{result.summary.format.toUpperCase()}</div>
                <div className="text-muted-foreground">Quality:</div>
                <div className="font-medium">{result.summary.quality}%</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Images (ZIP)
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
