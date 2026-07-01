"use client";

import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { OverlaySize } from "@/features/overlay/model";
import { buildOverlayUrl, OVERLAY_PRESETS } from "@/features/overlay/presets";

const SIZES = Object.keys(OVERLAY_PRESETS) as OverlaySize[];

export default function OverlayControls({ url }: { url: string }) {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<OverlaySize>("auto");
  const selectedUrl = useMemo(() => buildOverlayUrl(url, size), [size, url]);

  async function copyUrl() {
    await navigator.clipboard.writeText(selectedUrl);
    setCopied(true);
  }

  return (
    <>
      <fieldset className="space-y-3 tablet:col-span-3">
        <legend className="text-sm font-semibold">Overlay size</legend>
        <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
          {SIZES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              className="rounded-md border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10"
              onClick={() => {
                setSize(option);
                setCopied(false);
              }}
            >
              <span className="block font-semibold">{OVERLAY_PRESETS[option].label}</span>
              <span className="text-xs text-muted-foreground">{OVERLAY_PRESETS[option].dimensions}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Set the Browser Source to the suggested dimensions, or use Auto for any canvas size.
        </p>
      </fieldset>
      <Button className="w-full" onClick={copyUrl} type="button">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy URL"}
      </Button>
      <Button className="w-full" variant="secondary" onClick={() => setShowUrl((visible) => !visible)} type="button">
        {showUrl ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {showUrl ? "Hide URL" : "Show URL"}
      </Button>
      {showUrl ? (
        <div className="select-all break-all rounded-lg border border-border bg-muted/40 p-3 text-sm tablet:col-span-3">
          {selectedUrl}
        </div>
      ) : null}
    </>
  );
}
