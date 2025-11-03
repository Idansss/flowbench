import { NextRequest, NextResponse } from "next/server";
import { marketplace } from "@/lib/db-marketplace";

export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth
    const userId = request.headers.get("x-user-id") || "demo-user-id";

    const body = await request.json();
    const { displayName, username, tagline, description, skills } = body;

    // Validation
    if (!displayName || !username || !tagline) {
      return NextResponse.json(
        { error: "Display name, username, and tagline are required" },
        { status: 400 }
      );
    }

    // Check if username is available
    const existing = await marketplace.getSellerByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Create seller profile
    const seller = await marketplace.createSeller({
      userId,
      displayName,
      username,
      tagline,
      description,
    });

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        username: seller.username,
        displayName: seller.display_name,
      },
    });
  } catch (error) {
    console.error("Create seller error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create seller profile" },
      { status: 500 }
    );
  }
}

