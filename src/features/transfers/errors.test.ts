import { describe, expect, it } from "vitest";

import { getPublicTransferError } from "./errors";

describe("getPublicTransferError", () => {
  it("preserves supported business errors", () => {
    expect(getPublicTransferError("Pokemon is reserved in an open trade")).toBe(
      "Pokemon is reserved in an open trade",
    );
  });

  it("hides unexpected database details", () => {
    expect(
      getPublicTransferError(
        'duplicate key value violates unique constraint "trades_pkey"',
      ),
    ).toBe("The transfer could not be completed. Please try again.");
  });
});
