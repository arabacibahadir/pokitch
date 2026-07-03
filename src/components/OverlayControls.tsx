"use client";

import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function OverlayControls({
  url,
  onCopied,
}: {
  url: string;
  onCopied?: () => void;
}) {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyError(false);
      onCopied?.();
    } catch {
      setCopied(false);
      setCopyError(true);
      setShowUrl(true);
    }
  }

  return (
    <div className="grid gap-2 tablet:grid-cols-2">
      <Button onClick={copyUrl} type="button">
        {copied ? (
          <Check data-icon="inline-start" />
        ) : (
          <Copy data-icon="inline-start" />
        )}
        {copied ? "Copied" : "Copy responsive overlay URL"}
      </Button>
      <Button
        variant="secondary"
        onClick={() => setShowUrl((visible) => !visible)}
        type="button"
      >
        {showUrl ? (
          <EyeOff data-icon="inline-start" />
        ) : (
          <Eye data-icon="inline-start" />
        )}
        {showUrl ? "Hide URL" : "Show URL"}
      </Button>
      {showUrl ? (
        <div className="select-all break-all rounded-lg border border-border bg-muted/40 p-3 text-sm tablet:col-span-2">
          {url}
        </div>
      ) : null}
      {copyError ? (
        <p className="text-sm text-warning tablet:col-span-2" role="alert">
          Clipboard access was blocked. Select and copy the URL shown above.
        </p>
      ) : null}
    </div>
  );
}
