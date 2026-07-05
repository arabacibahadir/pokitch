"use client";

import { type ComponentProps, useEffect, useState } from "react";

import OverlayControls from "@/components/OverlayControls";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import {
  EMPTY_SETUP_PROGRESS,
  getSetupStorageKey,
  parseSetupProgress,
  type SetupProgress,
} from "@/features/setup/progress";

export function StreamerSetup({
  accountId,
  url,
}: {
  accountId: string;
  url: string;
}) {
  const [progress, setProgress] = useState<SetupProgress>(EMPTY_SETUP_PROGRESS);
  const storageKey = getSetupStorageKey(accountId);

  useEffect(() => {
    setProgress(parseSetupProgress(window.localStorage.getItem(storageKey)));
  }, [storageKey]);

  function update(next: Partial<SetupProgress>) {
    setProgress((current) => {
      const value = { ...current, ...next };
      window.localStorage.setItem(storageKey, JSON.stringify(value));
      return value;
    });
  }

  const completed =
    1 +
    Number(progress.overlayCopied) +
    Number(progress.browserSourceAdded) +
    Number(progress.botModerated);

  return (
    <div className="flex flex-col gap-5">
      <OverlayControls
        url={url}
        onCopied={() => update({ overlayCopied: true })}
      />
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Setup progress</h3>
            <p className="text-xs text-muted-foreground">
              {completed} of 4 steps complete
            </p>
          </div>
          <output
            className="font-mono text-sm font-bold"
            aria-live="polite"
            aria-label={`${completed} of 4 setup steps complete`}
          >
            {completed * 25}%
          </output>
        </div>
        <Progress className="mt-3" value={completed * 25} />
        <FieldGroup className="mt-4 gap-3">
          <ChecklistItem checked disabled label="Signed in with Twitch" />
          <ChecklistItem
            checked={progress.overlayCopied}
            disabled
            label="Responsive overlay URL copied"
          />
          <ChecklistItem
            checked={progress.browserSourceAdded}
            label="Browser source added to OBS (recommended size: 300 × 130)"
            onCheckedChange={(checked) =>
              update({ browserSourceAdded: checked === true })
            }
          />
          <ChecklistItem
            checked={progress.botModerated}
            label="Ran /mod pokitch_bot in Twitch chat"
            onCheckedChange={(checked) =>
              update({ botModerated: checked === true })
            }
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function ChecklistItem({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange?: ComponentProps<typeof Checkbox>["onCheckedChange"];
}) {
  const id = `setup-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  return (
    <Field className="flex-row items-center gap-3" data-disabled={disabled}>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </Field>
  );
}
