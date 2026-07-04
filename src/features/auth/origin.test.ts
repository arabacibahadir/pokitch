import { describe, expect, it } from "vitest";

import { getAppOrigin, getSafeNextPath } from "./origin";

describe("getAppOrigin", () => {
  it("normalizes the configured application URL", () => {
    expect(
      getAppOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://pokitch.tv/",
      }),
    ).toBe("https://pokitch.tv");
  });

  it("fails closed when production has no canonical URL", () => {
    expect(() => getAppOrigin({ NODE_ENV: "production" })).toThrow(
      "NEXT_PUBLIC_APP_URL is required",
    );
  });

  it("uses localhost in development without trusting request headers", () => {
    expect(getAppOrigin({ NODE_ENV: "development", PORT: "4000" })).toBe(
      "http://localhost:4000",
    );
  });

  it("falls back to localhost in development if a production URL is configured", () => {
    expect(
      getAppOrigin({
        NODE_ENV: "development",
        NEXT_PUBLIC_APP_URL: "https://pokitch.app",
        PORT: "4000",
      }),
    ).toBe("http://localhost:4000");
  });

  it("respects a configured localhost URL in development", () => {
    expect(
      getAppOrigin({
        NODE_ENV: "development",
        NEXT_PUBLIC_APP_URL: "http://localhost:5000",
        PORT: "4000",
      }),
    ).toBe("http://localhost:5000");
  });
});

describe("getSafeNextPath", () => {
  it("allows only supported post-login destinations", () => {
    expect(getSafeNextPath("/gift")).toBe("/gift");
    expect(getSafeNextPath("/trade")).toBe("/trade");
    expect(getSafeNextPath("/setup")).toBe("/setup");
    expect(getSafeNextPath("/collections?mode=poke")).toBe("/");
  });

  it.each(["https://attacker.test", "//attacker.test", "javascript:alert(1)"])(
    "rejects external target %s",
    (target) => expect(getSafeNextPath(target)).toBe("/"),
  );
});
