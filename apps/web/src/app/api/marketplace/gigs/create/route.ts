import { NextRequest, NextResponse } from "next/server";
import { marketplace } from "@/lib/db-marketplace";
import { z } from "zod";

const PackageSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(5),
  deliveryDays: z.number().min(1),
  revisions: z.number().nullable(),
  features: z.array(z.string()).min(1),
});

const GigSchema = z.object({
  title: z.string().min(10).max(100),
  slug: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  description: z.string().min(100).max(2000),
  packages: z.object({
    basic: PackageSchema,
    standard: PackageSchema.optional(),
    premium: PackageSchema.optional(),
  }),
  galleryUrls: z.array(z.string().url()).max(3).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  searchTags: z.array(z.string()).min(3).max(5),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get seller ID from session
    const sellerId = request.headers.get("x-seller-id") || "demo-seller-id";

    const body = await request.json();

    // Validate
    const validated = GigSchema.parse(body);

    // Create gig
    const gig = await marketplace.createGig({
      sellerId,
      title: validated.title,
      slug: validated.slug,
      category: validated.category,
      description: validated.description,
      searchTags: validated.searchTags,
    });

    // Create packages
    const packagesToCreate = [
      { tier: "basic", data: validated.packages.basic },
      validated.packages.standard && { tier: "standard", data: validated.packages.standard },
      validated.packages.premium && { tier: "premium", data: validated.packages.premium },
    ].filter(Boolean) as Array<{ tier: string; data: z.infer<typeof PackageSchema> }>;

    await Promise.all(
      packagesToCreate.map((pkg) =>
        marketplace.createPackage({
          gigId: gig.id,
          tier: pkg.tier,
          name: pkg.data.name,
          price: pkg.data.price,
          deliveryDays: pkg.data.deliveryDays,
          features: pkg.data.features,
        })
      )
    );

    // Update gig with media and FAQ
    if (validated.galleryUrls || validated.videoUrl || validated.faq) {
      await marketplace.updateGig(gig.id, {
        gallery_urls: validated.galleryUrls || [],
        video_url: validated.videoUrl || null,
        faq: validated.faq || [],
      });
    }

    return NextResponse.json({
      success: true,
      gig: {
        id: gig.id,
        slug: gig.slug,
        title: gig.title,
      },
    });
  } catch (error) {
    console.error("Create gig error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create gig" },
      { status: 500 }
    );
  }
}

