"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Switch } from "./switch";
import { Label } from "./label";
import { isTelemetryOptedOut, optOutOfTelemetry } from "@/lib/observability";

export function TelemetryToggle() {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(isTelemetryOptedOut());
  }, []);

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      optOutOfTelemetry();
      setOptedOut(true);
    } else {
      localStorage.removeItem("telemetry-opt-out");
      setOptedOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anonymous Analytics</CardTitle>
        <CardDescription>
          Help us improve Flowbench by sharing anonymous usage data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="telemetry">Enable telemetry</Label>
          <Switch
            id="telemetry"
            checked={!optedOut}
            onCheckedChange={handleToggle}
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>When enabled, we collect:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Tool usage statistics</li>
            <li>Error reports</li>
            <li>Performance metrics</li>
          </ul>
          <p className="mt-2">We never collect:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Personal information</li>
            <li>File contents</li>
            <li>Identifiable data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

