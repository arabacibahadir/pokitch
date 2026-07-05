import { describe, expect, it } from "vitest";

import { buildOverlayUrl, OVERLAY_PRESETS } from "./presets";

describe("overlay presets", () => {
  it("exposes the supported OBS dimensions", () => {
    expect(OVERLAY_PRESETS.compact.dimensions).toBe("256 × 76");
    expect(OVERLAY_PRESETS.standard.dimensions).toBe("300 × 130");
    expect(OVERLAY_PRESETS.large.dimensions).toBe("640 × 180");
  });

  it("keeps auto URLs backwards compatible and adds explicit presets", () => {
    const base = "https://pokitch.example/overlays/account-id";
    expect(buildOverlayUrl(base, "auto")).toBe(base);
    expect(buildOverlayUrl(base, "compact")).toBe(`${base}?size=compact`);
  });
});
