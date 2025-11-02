import { NextRequest, NextResponse } from "next/server";
import { parseCSV, generateCSV } from "@flowbench/lib";
import { JobService } from "@/lib/job-service";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const SYSTEM_PROMPT = `You are an expert cold email copywriter. Generate personalized, effective outreach emails.

Rules:
- Use provided persona and tone
- Keep subject lines under 60 characters
- Preview text should hook the reader (40-100 chars)
- Body should be concise and value-focused
- Use merge tokens like {firstName}, {company}
- Include clear CTAs
- Avoid spam triggers`;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const config = JSON.parse(configStr || "{}");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "email-templater",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Parse leads CSV
    const file = files[0];
    const parseStep = await JobService.measureStep("Parse Leads", async () => {
      return await parseCSV(file);
    });

    const csvData = parseStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Parse Leads",
      description: `Parsed ${csvData.rows.length} leads from ${file.name}`,
      counts: {
        leads: csvData.rows.length,
        columns: csvData.headers.length,
      },
      durationMs: parseStep.durationMs,
    });

    // Validate tokens exist in CSV
    const availableTokens = csvData.headers;
    const warnings: string[] = [];

    // Step 2: Generate template
    const templateStep = await JobService.measureStep("Generate Template", async () => {
      const persona = config.persona || "sales representative";
      const tone = config.tone || "professional";
      const objective = config.objective || "schedule a demo";

      const completion = await openai!.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        seed: config.seed || 42,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a cold email template for a ${persona} with a ${tone} tone to ${objective}.

Available merge tokens: ${availableTokens.map((t) => `{${t}}`).join(", ")}

Return as JSON with: subject, previewText, body

Keep subject under 60 chars, preview 40-100 chars, body 150-250 words.`,
          },
        ],
      });

      return JSON.parse(completion.choices[0].message.content || "{}");
    });

    const template = templateStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Template",
      description: "Created email template with merge tokens",
      durationMs: templateStep.durationMs,
    });

    // Step 3: Validate tokens in template
    const validateStep = await JobService.measureStep("Validate Tokens", async () => {
      const tokenPattern = /\{(\w+)\}/g;
      const templateText = JSON.stringify(template);
      const usedTokens = new Set<string>();
      let match;

      while ((match = tokenPattern.exec(templateText)) !== null) {
        usedTokens.add(match[1]);
      }

      const missingTokens = Array.from(usedTokens).filter(
        (token) => !availableTokens.includes(token)
      );

      if (missingTokens.length > 0) {
        warnings.push(
          `Template uses tokens not in CSV: ${missingTokens.join(", ")}`
        );
      }

      return {
        usedTokens: Array.from(usedTokens),
        missingTokens,
      };
    });

    const validation = validateStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Validate Tokens",
      description: `Validated ${validation.usedTokens.length} merge tokens`,
      counts: {
        tokens: validation.usedTokens.length,
        missing: validation.missingTokens.length,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: validateStep.durationMs,
    });

    // Step 4: Create mail merge CSV
    const mergeRows = csvData.rows.map((row) => {
      return {
        ...row,
        subject: template.subject || "",
        preview_text: template.previewText || "",
        body: template.body || "",
      };
    });

    const mergeCsv = generateCSV(mergeRows);

    // Create output
    const output = {
      template,
      validation,
      stats: {
        leads: csvData.rows.length,
        tokensUsed: validation.usedTokens,
        tokensMissing: validation.missingTokens,
      },
      instructions: [
        "Review and customize the template",
        "Ensure all merge tokens have values in your CSV",
        "Test with a small batch first",
        "Personalize where possible for better response rates",
      ],
    };

    const outputJson = JSON.stringify(output, null, 2);

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        leads: csvData.rows.length,
        tokensUsed: validation.usedTokens.length,
        tokensMissing: validation.missingTokens.length,
      },
      outputFiles: [
        {
          name: "email-template.json",
          data: Buffer.from(outputJson, "utf-8"),
          mimeType: "application/json",
        },
        {
          name: "mail-merge.csv",
          data: Buffer.from(mergeCsv, "utf-8"),
          mimeType: "text/csv",
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
        leads: csvData.rows.length,
        tokensUsed: validation.usedTokens.length,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Email Templater error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

