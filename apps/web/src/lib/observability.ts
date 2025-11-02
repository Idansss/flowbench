// Observability setup - Sentry and PostHog

import { config } from "@/config";

// Sentry initialization (server-side)
export function initSentry() {
  if (!config.enableSentry || !config.sentryDSN) {
    return;
  }

  // In production, you would import and initialize Sentry here:
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({ dsn: config.sentryDSN });
  
  console.log("Sentry initialized");
}

// PostHog client-side tracking
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (!config.enablePosthog) return;

  // In production, use PostHog SDK:
  // window.posthog?.capture(eventName, properties);
  
  console.log("Event tracked:", eventName, properties);
}

// Error tracking
export function captureException(error: Error, context?: Record<string, any>) {
  console.error("Error captured:", error, context);
  
  if (config.enableSentry) {
    // In production: Sentry.captureException(error, { extra: context });
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

