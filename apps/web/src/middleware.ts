import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { config } from "@/config";

// Rate limiting middleware
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply rate limiting to API routes
  if (pathname.startsWith("/api/tools/")) {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const userId = request.cookies.get("userId")?.value;

    try {
      // Check IP-based rate limit
      const ipAllowed = await db.checkRateLimit(
        ip,
        "ip",
        pathname,
        config.rateLimitPerIP
      );

      if (!ipAllowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Maximum ${config.rateLimitPerIP} requests per hour from your IP`,
            retryAfter: 3600,
          },
          {
            status: 429,
            headers: {
              "Retry-After": "3600",
              "X-RateLimit-Limit": config.rateLimitPerIP.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      // Check user-based rate limit if authenticated
      if (userId) {
        const userAllowed = await db.checkRateLimit(
          userId,
          "user",
          pathname,
          config.rateLimitPerUser
        );

        if (!userAllowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              message: `Maximum ${config.rateLimitPerUser} requests per hour per user`,
              retryAfter: 3600,
            },
            {
              status: 429,
              headers: {
                "Retry-After": "3600",
                "X-RateLimit-Limit": config.rateLimitPerUser.toString(),
                "X-RateLimit-Remaining": "0",
              },
            }
          );
        }
      }
    } catch (error) {
      // Log error but don't block request if rate limit check fails
      console.error("Rate limit check failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/tools/:path*",
};

