import * as React from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { Label } from "./label";

export interface Preset {
  id: string;
  name: string;
  config: Record<string, any>;
  isDefault?: boolean;
}

interface PresetPickerProps {
  presets: Preset[];
  selectedPresetId?: string;
  onSelectPreset: (presetId: string) => void;
  onSavePreset: (name: string, config: Record<string, any>) => void;
  onDeletePreset?: (presetId: string) => void;
  currentConfig: Record<string, any>;
  className?: string;
}

export function PresetPicker({
  presets,
  selectedPresetId,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  currentConfig,
  className,
}: PresetPickerProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState("");

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  const handleSaveNew = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim(), currentConfig);
      setNewPresetName("");
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="preset-select">Configuration Preset</Label>
          <Select value={selectedPresetId} onValueChange={onSelectPreset}>
            <SelectTrigger id="preset-select">
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    {preset.isDefault && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    <span>{preset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPreset && onDeletePreset && !selectedPreset.isDefault && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDeletePreset(selectedPreset.id)}
            title="Delete preset"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => setIsCreating(!isCreating)}
          title="Save as new preset"
        >
          <Plus className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {isCreating && (
        <div className="flex gap-2 p-3 bg-accent rounded-md">
          <Input
            placeholder="Preset name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveNew();
              } else if (e.key === "Escape") {
                setIsCreating(false);
                setNewPresetName("");
              }
            }}
            autoFocus
          />
          <Button onClick={handleSaveNew} size="sm" disabled={!newPresetName.trim()}>
            Save
          </Button>
          <Button
            onClick={() => {
              setIsCreating(false);
              setNewPresetName("");
            }}
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      )}

      {selectedPreset && (
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
          <p className="font-medium mb-1">Current preset: {selectedPreset.name}</p>
          <p>{Object.keys(selectedPreset.config).length} configuration options</p>
        </div>
      )}
    </div>
  );
}

