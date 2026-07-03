import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("semantic color system", () => {
  const css = readFileSync(resolve("src/styles/globals.css"), "utf8");
  const button = readFileSync(resolve("src/components/ui/button.tsx"), "utf8");

  it("defines reusable status color roles", () => {
    for (const token of ["success", "warning", "info"]) {
      expect(css).toContain(`--${token}:`);
      expect(css).toContain(`--${token}-foreground:`);
    }
  });

  it("keeps button variants independent from palette names", () => {
    expect(button).not.toMatch(/(?:violet|emerald|red|green|yellow)-\d{2,3}/);
    expect(button).not.toContain('variant: {\n        twitch:');
  });

  it("uses semantic status colors in overlay styles", () => {
    expect(css).not.toMatch(/#(?:22c55e|eab308|ef4444|86efac|fca5a5)/i);
    expect(css).toContain("oklch(var(--success)");
    expect(css).toContain("oklch(var(--warning)");
  });
});
