import * as React from "react";
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export interface AuditStep {
  stepNumber: number;
  stepName: string;
  description: string;
  inputSummary?: Record<string, any>;
  outputSummary?: Record<string, any>;
  warnings?: string[];
  counts?: Record<string, number>;
  durationMs?: number;
  status?: "success" | "warning" | "error";
}

interface AuditViewerProps {
  steps: AuditStep[];
  className?: string;
}

export function AuditViewer({ steps, className }: AuditViewerProps) {
  const totalDuration = steps.reduce((sum, step) => sum + (step.durationMs || 0), 0);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audit Trail</span>
          <span className="text-sm font-normal text-muted-foreground">
            <Clock className="inline w-4 h-4 mr-1" />
            Total: {formatDuration(totalDuration)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const status = step.status || "success";

            return (
              <div key={step.stepNumber} className="relative">
                {!isLast && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        status === "success" && "bg-green-100 text-green-600",
                        status === "warning" && "bg-yellow-100 text-yellow-600",
                        status === "error" && "bg-red-100 text-red-600"
                      )}
                    >
                      {status === "success" && <CheckCircle2 className="w-5 h-5" />}
                      {status === "warning" && <AlertCircle className="w-5 h-5" />}
                      {status === "error" && <AlertCircle className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 pb-6">
                    <div>
                      <h4 className="font-medium text-sm">
                        {step.stepNumber}. {step.stepName}
                      </h4>
                      {step.durationMs !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(step.durationMs)}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>

                    {step.counts && Object.keys(step.counts).length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {Object.entries(step.counts).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-1 text-xs bg-accent px-2 py-1 rounded"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-medium">{value}</span>
                            <span className="text-muted-foreground">
                              {key.replace(/_/g, " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.warnings && step.warnings.length > 0 && (
                      <div className="space-y-1 pt-2">
                        {step.warnings.map((warning, wIdx) => (
                          <div
                            key={wIdx}
                            className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2 rounded"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

