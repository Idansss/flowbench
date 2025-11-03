"use client";

import { useState } from "react";
import { Share2, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/shared/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AuditViewer } from "@/components/ui/audit-viewer";
import { useToast } from "@/hooks/use-toast";

interface Options {
  seed: number;
}

export function BlogAtomizerTool() {
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [options, setOptions] = useState<Options>({
    seed: 42,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!url && !html) {
      toast({
        title: "No input provided",
        description: "Please provide a blog URL or paste HTML",
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
      if (html) formData.append("html", html);
      formData.append("config", JSON.stringify(options));

      const response = await fetch("/api/tools/blog-atomizer", {
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
        description: `Created content for Twitter, LinkedIn, and Instagram`,
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
      icon={Share2}
      title="Blog to Social Atomizer"
      description="Convert blog posts into social media content"
      inputPanel={
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-url">Blog URL</Label>
            <Input
              id="blog-url"
              placeholder="https://example.com/blog-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">OR</div>

          <div className="space-y-2">
            <Label htmlFor="html">Paste HTML</Label>
            <textarea
              id="html"
              className="w-full h-40 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste article HTML here..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
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
          </div>

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-accent rounded">
            <p><strong>Will generate:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>Twitter thread (7 tweets)</li>
              <li>LinkedIn post</li>
              <li>Instagram caption</li>
              <li>Carousel outline (10 slides)</li>
              <li>Editorial checklist</li>
              <li>Posting cadence</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handleProcess}
            disabled={(!url && !html) || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Social Content"
            )}
          </Button>

          {processing && <Progress value={progress} />}
        </>
      }
      resultsPanel={
        !result ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Social media content will appear here
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Tweets:</div>
                <div className="font-medium">{result.summary.tweets}</div>
                <div className="text-muted-foreground">LinkedIn:</div>
                <div className="font-medium">{result.summary.linkedinPosts}</div>
                <div className="text-muted-foreground">Instagram:</div>
                <div className="font-medium">{result.summary.instagramCaptions}</div>
                <div className="text-muted-foreground">Carousel slides:</div>
                <div className="font-medium">{result.summary.carouselSlides}</div>
              </div>
            </div>

            <Button className="w-full" onClick={() => window.location.href = result.downloadUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download Social Content
            </Button>

            <div className="text-xs text-muted-foreground">
              Bundle includes all platforms + editorial checklist
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
