import { describe, expect, it } from "vitest";

import { getSetupStorageKey, parseSetupProgress } from "./progress";

describe("setup progress storage", () => {
  it("versions progress per account", () => {
    expect(getSetupStorageKey("account-1")).toBe("pokitch:setup:v1:account-1");
  });

  it("accepts only boolean manual progress flags", () => {
    expect(
      parseSetupProgress(
        JSON.stringify({
          overlayCopied: true,
          browserSourceAdded: true,
          botModerated: false,
        }),
      ),
    ).toEqual({
      overlayCopied: true,
      browserSourceAdded: true,
      botModerated: false,
    });
    expect(parseSetupProgress("not-json")).toEqual({
      overlayCopied: false,
      browserSourceAdded: false,
      botModerated: false,
    });
  });
});
