const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseGiftInput(input: unknown) {
  const value = input as Record<string, unknown>;
  const collectionId = readString(value?.collectionId);
  const recipientTwitchId = readString(value?.recipientTwitchId);

  if (!UUID_PATTERN.test(collectionId) || !recipientTwitchId) {
    throw new Error("Invalid gift request");
  }

  return { collectionId, recipientTwitchId };
}

export function parseTradeOfferInput(input: unknown) {
  const value = input as Record<string, unknown>;
  const offeredCollectionId = readString(value?.offeredCollectionId);
  const requestedCollectionId = readString(value?.requestedCollectionId);

  if (
    !UUID_PATTERN.test(offeredCollectionId) ||
    !UUID_PATTERN.test(requestedCollectionId) ||
    offeredCollectionId === requestedCollectionId
  ) {
    throw new Error("Invalid trade request");
  }

  return { offeredCollectionId, requestedCollectionId };
}

export function parseTradeDecisionInput(input: unknown) {
  const value = input as Record<string, unknown>;
  const tradeId = readString(value?.tradeId);
  const decision = readString(value?.decision);

  if (
    !UUID_PATTERN.test(tradeId) ||
    !["accept", "deny", "cancel"].includes(decision)
  ) {
    throw new Error("Invalid trade decision");
  }

  return {
    tradeId,
    decision: decision as "accept" | "deny" | "cancel",
  };
}
