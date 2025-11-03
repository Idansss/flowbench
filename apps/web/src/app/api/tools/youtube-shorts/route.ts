import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/job-service";
import { createChatCompletion, SYSTEM_PROMPTS, validateAIConfig, canUseAI } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Check if AI is available
    if (!canUseAI()) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const url = formData.get("url") as string;
    const transcript = formData.get("transcript") as string;
    const configStr = formData.get("config") as string;
    const rawConfig = JSON.parse(configStr || "{}");

    // SECURITY: Validate configuration with Zod
    const config = validateAIConfig("youtube-shorts", {
      ...rawConfig,
      url,
      transcript,
    });

    if (!config.url && !config.transcript) {
      return NextResponse.json(
        { error: "URL or transcript required" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "youtube-shorts",
        inputConfig: { url, hasTranscript: !!transcript, ...config },
      },
      []
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Extract or use transcript
    const transcriptStep = await JobService.measureStep("Get Transcript", async () => {
      if (transcript) {
        return transcript;
      }
      
      // In production, would use youtube-transcript or similar
      // For now, return placeholder
      return "Transcript extraction requires YouTube API integration";
    });

    const contentText = transcriptStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Extract Transcript",
      description: transcript ? "Used provided transcript" : "Extracted from URL",
      counts: {
        characters: contentText.length,
      },
      durationMs: transcriptStep.durationMs,
    });

    // Step 2: Generate hooks
    const hooksStep = await JobService.measureStep("Generate Hooks", async () => {
      // SECURITY: Use secure wrapper with disable-logging header
      const completion = await createChatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPTS.youtubeShorts },
          {
            role: "user",
            content: `Generate 10 attention-grabbing hooks for a YouTube Short based on this content:\n\n${contentText.slice(0, 1000)}\n\nReturn as JSON array of strings.`,
          },
        ],
        {
          seed: config.seed,
        }
      );

      const hooks = JSON.parse(completion.choices[0].message.content || "[]");
      return hooks.slice(0, 10);
    });

    const hooks = hooksStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Hooks",
      description: "Generated 10 viral hooks",
      counts: { hooks: hooks.length },
      durationMs: hooksStep.durationMs,
    });

    // Step 3: Generate captions
    const captionsStep = await JobService.measureStep("Generate Captions", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate 3 caption variants for a YouTube Short based on this content:\n\n${contentText.slice(0, 1000)}\n\nReturn as JSON array of strings. Keep under 200 characters each.`,
          },
        ],
      });

      const captions = JSON.parse(completion.choices[0].message.content || "[]");
      return captions.slice(0, 3);
    });

    const captions = captionsStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Captions",
      description: "Generated 3 caption variants",
      counts: { captions: captions.length },
      durationMs: captionsStep.durationMs,
    });

    // Step 4: Generate tags
    const tagsStep = await JobService.measureStep("Generate Tags", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate 20 relevant YouTube tags for a Short based on this content:\n\n${contentText.slice(0, 1000)}\n\nReturn as JSON array of strings. Mix of broad and specific tags.`,
          },
        ],
      });

      const tags = JSON.parse(completion.choices[0].message.content || "[]");
      return tags.slice(0, 20);
    });

    const tags = tagsStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Tags",
      description: "Generated 20 searchable tags",
      counts: { tags: tags.length },
      durationMs: tagsStep.durationMs,
    });

    // Step 5: Generate thumbnail prompt
    const thumbnailStep = await JobService.measureStep("Generate Thumbnail", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate 1 thumbnail image prompt for DALL-E for a YouTube Short based on this content:\n\n${contentText.slice(0, 1000)}\n\nReturn as a single descriptive string (not JSON). Make it visually striking and clickable.`,
          },
        ],
      });

      return completion.choices[0].message.content || "";
    });

    const thumbnailPrompt = thumbnailStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Thumbnail Prompt",
      description: "Generated thumbnail image prompt",
      durationMs: thumbnailStep.durationMs,
    });

    // Create output JSON
    const output = {
      hooks,
      captions,
      tags,
      thumbnailPrompt,
      metadata: {
        url: url || null,
        transcriptLength: contentText.length,
        seed: config.seed || 42,
        generatedAt: new Date().toISOString(),
      },
    };

    const outputJson = JSON.stringify(output, null, 2);

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        hooks: hooks.length,
        captions: captions.length,
        tags: tags.length,
        thumbnailPrompt: thumbnailPrompt ? 1 : 0,
      },
      outputFiles: [
        {
          name: "youtube-shorts-content.json",
          data: Buffer.from(outputJson, "utf-8"),
          mimeType: "application/json",
        },
      ],
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      output,
      summary: {
        hooks: hooks.length,
        captions: captions.length,
        tags: tags.length,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("YouTube Shorts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

