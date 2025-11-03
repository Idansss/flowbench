"use client";

import { useState } from "react";
import { Video, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  seed: number;
}

export function YoutubeShortsTool() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [options, setOptions] = useState<Options>({
    seed: 42,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!url && !transcript) {
      toast({
        title: "No input provided",
        description: "Please provide a YouTube URL or paste a transcript",
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
      if (url) formData.append("url", url);
      if (transcript) formData.append("transcript", transcript);
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/youtube-shorts", {
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
        title: "Content generated!",
        description: `Created ${data.summary.hooks} hooks, ${data.summary.captions} captions, ${data.summary.tags} tags`,
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
      icon={Video}
      title="YouTube Shorts Generator"
      description="Create captions, hooks, and tags for short-form videos"
      inputPanel={
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">OR</div>

          <div className="space-y-2">
            <Label htmlFor="transcript">Paste Transcript</Label>
            <textarea
              id="transcript"
              className="w-full h-40 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste your video transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
        </div>
      }
      optionsPanel={
        <>
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (for reproducibility)</Label>
            <Input
              id="seed"
              type="number"
              value={options.seed}
              onChange={(e) =>
                setOptions({ ...options, seed: parseInt(e.target.value) || 42 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Use the same seed to get identical results
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-accent rounded">
            <p><strong>Will generate:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>10 attention-grabbing hooks</li>
              <li>3 caption variants</li>
              <li>20 relevant tags</li>
              <li>1 thumbnail prompt</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handleProcess}
            disabled={(!url && !transcript) || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Content"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            AI-generated content will appear here
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="text-sm font-medium">Generated Content</div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Hooks:</strong> {result.summary.hooks}</div>
                <div><strong>Captions:</strong> {result.summary.captions}</div>
                <div><strong>Tags:</strong> {result.summary.tags}</div>
              </div>

              {result.output && (
                <div className="max-h-40 overflow-y-auto text-xs bg-accent p-3 rounded">
                  <p><strong>Preview (first hook):</strong></p>
                  <p className="mt-1 italic">{result.output.hooks?.[0]}</p>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Content (JSON)
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
