import type { OverlaySize } from "./model";

export const OVERLAY_PRESETS = {
  auto: { label: "Auto", dimensions: "Responsive" },
  compact: { label: "Compact", dimensions: "256 × 76" },
  standard: { label: "Standard", dimensions: "300 × 130" },
  large: { label: "Large", dimensions: "640 × 180" },
} as const satisfies Record<OverlaySize, { label: string; dimensions: string }>;

export function buildOverlayUrl(baseUrl: string, size: OverlaySize) {
  if (size === "auto") return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set("size", size);
  return url.toString();
}
