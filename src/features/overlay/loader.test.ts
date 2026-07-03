import { describe, expect, it, vi } from "vitest";

import { loadOverlay } from "./loader";

describe("loadOverlay", () => {
  it("returns missing only when the account has no channel", async () => {
    const result = await loadOverlay("missing", {
      getChannel: vi.fn().mockResolvedValue(null),
      getPoke: vi.fn(),
    });

    expect(result).toEqual({ status: "missing" });
  });

  it("preserves data access failures", async () => {
    const failure = new Error("database unavailable");

    await expect(
      loadOverlay("account", {
        getChannel: vi.fn().mockRejectedValue(failure),
        getPoke: vi.fn(),
      }),
    ).rejects.toBe(failure);
  });

  it("allows a valid overlay to have no active pokemon", async () => {
    const result = await loadOverlay("account", {
      getChannel: vi.fn().mockResolvedValue("channel"),
      getPoke: vi.fn().mockResolvedValue(null),
    });

    expect(result).toEqual({
      status: "ready",
      channel: "channel",
      initialPoke: null,
    });
  });
});
