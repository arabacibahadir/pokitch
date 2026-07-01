import { describe, expect, it } from "vitest";

import {
  parseGiftInput,
  parseTradeDecisionInput,
  parseTradeOfferInput,
} from "./validation";

describe("transfer validation", () => {
  it("accepts a valid gift payload", () => {
    expect(
      parseGiftInput({
        collectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
        recipientTwitchId: "123456789",
      }),
    ).toEqual({
      collectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
      recipientTwitchId: "123456789",
    });
  });

  it("rejects malformed gift payloads", () => {
    expect(() =>
      parseGiftInput({ collectionId: "not-a-uuid", recipientTwitchId: "" }),
    ).toThrow("Invalid gift request");
  });

  it("accepts a valid trade offer", () => {
    expect(
      parseTradeOfferInput({
        offeredCollectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
        requestedCollectionId: "3fab64f8-50df-48bc-aa91-9950525125ee",
      }),
    ).toEqual({
      offeredCollectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
      requestedCollectionId: "3fab64f8-50df-48bc-aa91-9950525125ee",
    });
  });

  it("prevents offering and requesting the same collection row", () => {
    expect(() =>
      parseTradeOfferInput({
        offeredCollectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
        requestedCollectionId: "4a01bcd4-4b99-4fef-9b86-857f2ce69e44",
      }),
    ).toThrow("Invalid trade request");
  });

  it("normalizes trade decision payloads", () => {
    expect(
      parseTradeDecisionInput({
        tradeId: "79c06cac-123b-43fa-a2dd-21dfe45c9297",
        decision: "accept",
      }),
    ).toEqual({
      tradeId: "79c06cac-123b-43fa-a2dd-21dfe45c9297",
      decision: "accept",
    });
  });
});
