// Observability setup - Sentry and PostHog

import { config } from "@/config";

// Dynamic Sentry import (only load if enabled)
let Sentry: any = null;

// Sentry initialization (server-side)
export async function initSentry() {
  if (!config.enableSentry || !config.sentryDSN) {
    return;
  }

  try {
    // Dynamic import to avoid loading if not needed
    Sentry = await import("@sentry/nextjs");
    
    Sentry.init({
      dsn: config.sentryDSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      beforeSend(event: any) {
        // Redact PII before sending
        return redactPII(event);
      },
    });
    
    console.log("✅ Sentry initialized");
  } catch (error) {
    console.warn("Sentry initialization failed:", error);
  }
}

// PostHog client-side tracking
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (!config.enablePosthog) return;
  if (isTelemetryOptedOut()) return;

  // Check if PostHog is loaded
  const posthog = (window as any).posthog;
  if (posthog) {
    // Redact PII from properties
    const redactedProps = properties ? redactPII(properties) : undefined;
    posthog.capture(eventName, redactedProps);
  } else {
    console.log("Event tracked (PostHog not loaded):", eventName, properties);
  }
}

// Error tracking
export function captureException(error: Error, context?: Record<string, any>) {
  // Always log to console
  console.error("Error captured:", error, context);
  
  if (config.enableSentry && Sentry) {
    // Redact context before sending
    const redactedContext = context ? redactPII(context) : undefined;
    Sentry.captureException(error, { extra: redactedContext });
  }
}

// Performance monitoring
export function trackPerformance(metric: string, value: number, tags?: Record<string, string>) {
  if (!config.enableSentry) return;
  
  // In production: Sentry.addBreadcrumb({ category: "performance", message: metric, data: { value, ...tags } });
  
  console.log("Performance metric:", metric, value, tags);
}

// Privacy-respecting user identification
export function identifyUser(userId: string, properties?: { telemetryOptIn?: boolean }) {
  if (!properties?.telemetryOptIn) return;
  if (!config.enablePosthog) return;
  
  // In production: window.posthog?.identify(userId, properties);
  
  console.log("User identified:", userId);
}

// Opt-out mechanism
export function optOutOfTelemetry() {
  if (typeof window === "undefined") return;
  
  localStorage.setItem("telemetry-opt-out", "true");
  
  // In production: window.posthog?.opt_out_capturing();
  
  console.log("Opted out of telemetry");
}

// Check opt-out status
export function isTelemetryOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("telemetry-opt-out") === "true";
}

// Redact PII from logs
export function redactPII(data: any): any {
  if (typeof data === "string") {
    // Redact emails
    data = data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");
    // Redact phone numbers
    data = data.replace(/\d{3}-\d{3}-\d{4}/g, "[PHONE_REDACTED]");
  } else if (typeof data === "object" && data !== null) {
    const redacted: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (["email", "phone", "ssn", "password"].includes(key.toLowerCase())) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactPII(data[key]);
      }
    }
    return redacted;
  }
  return data;
}

