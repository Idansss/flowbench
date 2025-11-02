import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/job-service";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const SYSTEM_PROMPT = `You are a social media content strategist. Convert blog posts into engaging social media content across platforms.

Rules:
- Preserve key insights and takeaways
- Adapt tone for each platform (Twitter: concise, LinkedIn: professional, Instagram: visual)
- Keep code blocks intact when present
- Generate platform-specific formats
- Include posting cadence suggestions
- Focus on engagement and value`;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const url = formData.get("url") as string;
    const html = formData.get("html") as string;
    const configStr = formData.get("config") as string;
    const config = JSON.parse(configStr || "{}");

    if (!url && !html) {
      return NextResponse.json(
        { error: "URL or HTML content required" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "blog-atomizer",
        inputConfig: { url, hasHtml: !!html, ...config },
      },
      []
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Fetch or parse content
    const contentStep = await JobService.measureStep("Extract Content", async () => {
      if (html) {
        // Strip HTML tags (simplified)
        return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      }

      if (url) {
        // Fetch URL
        const response = await fetch(url);
        const htmlContent = await response.text();
        return htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      }

      return "";
    });

    const articleText = contentStep.result.slice(0, 3000); // Limit for API
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Extract Content",
      description: url ? `Fetched content from ${url}` : "Parsed provided HTML",
      counts: {
        characters: articleText.length,
      },
      durationMs: contentStep.durationMs,
    });

    // Step 2: Generate Twitter threads
    const twitterStep = await JobService.measureStep("Generate Twitter", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a 7-tweet Twitter thread from this article:\n\n${articleText}\n\nReturn as JSON array of strings. Keep each tweet under 280 characters.`,
          },
        ],
      });

      return JSON.parse(completion.choices[0].message.content || "[]");
    });

    const tweets = twitterStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Twitter Thread",
      description: `Created ${tweets.length} tweets`,
      counts: { tweets: tweets.length },
      durationMs: twitterStep.durationMs,
    });

    // Step 3: Generate LinkedIn post
    const linkedinStep = await JobService.measureStep("Generate LinkedIn", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a professional LinkedIn post from this article:\n\n${articleText}\n\nReturn as plain text. Include key insights, keep under 1300 characters.`,
          },
        ],
      });

      return completion.choices[0].message.content || "";
    });

    const linkedinPost = linkedinStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate LinkedIn Post",
      description: "Created professional LinkedIn post",
      counts: { characters: linkedinPost.length },
      durationMs: linkedinStep.durationMs,
    });

    // Step 4: Generate Instagram caption
    const instagramStep = await JobService.measureStep("Generate Instagram", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create an Instagram caption from this article:\n\n${articleText}\n\nReturn as plain text. Include emojis, keep under 2200 characters. Add 5-10 hashtags at the end.`,
          },
        ],
      });

      return completion.choices[0].message.content || "";
    });

    const instagramCaption = instagramStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Instagram Caption",
      description: "Created Instagram caption with hashtags",
      counts: { characters: instagramCaption.length },
      durationMs: instagramStep.durationMs,
    });

    // Step 5: Create carousel outline
    const carouselStep = await JobService.measureStep("Carousel Outline", async () => {
      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a 10-slide Instagram carousel outline from this article:\n\n${articleText}\n\nReturn as JSON array of objects with "title" and "content" for each slide.`,
          },
        ],
      });

      return JSON.parse(completion.choices[0].message.content || "[]");
    });

    const carouselSlides = carouselStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Create Carousel Outline",
      description: `Outlined ${carouselSlides.length} carousel slides`,
      counts: { slides: carouselSlides.length },
      durationMs: carouselStep.durationMs,
    });

    // Create output
    const output = {
      twitter: {
        thread: tweets,
        suggestedSchedule: "Post thread on Tuesday or Wednesday 10 AM",
      },
      linkedin: {
        post: linkedinPost,
        suggestedSchedule: "Post on weekday mornings 8-9 AM",
      },
      instagram: {
        caption: instagramCaption,
        carousel: carouselSlides,
        suggestedSchedule: "Post carousel on weekend afternoons",
      },
      editorialChecklist: [
        "Review all generated content for accuracy",
        "Customize with your brand voice",
        "Add relevant links and CTAs",
        "Check hashtags are appropriate",
        "Schedule across different days",
      ],
      metadata: {
        sourceUrl: url || null,
        seed: config.seed || 42,
        generatedAt: new Date().toISOString(),
      },
    };

    const outputJson = JSON.stringify(output, null, 2);

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        tweets: tweets.length,
        linkedinPosts: 1,
        instagramCaptions: 1,
        carouselSlides: carouselSlides.length,
      },
      outputFiles: [
        {
          name: "social-content.json",
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
        tweets: tweets.length,
        linkedinPosts: 1,
        instagramCaptions: 1,
        carouselSlides: carouselSlides.length,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Blog Atomizer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

