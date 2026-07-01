const PUBLIC_TRANSFER_ERRORS = new Set([
  "A Pokemon cannot be traded for itself",
  "Authentication required",
  "Gift recipient was not found",
  "Invalid gift recipient",
  "Invalid trade decision",
  "Offered Pokemon is not owned by the current user",
  "One of the Pokemon is no longer available",
  "One of the Pokemon is reserved in another trade",
  "Only the recipient can resolve this offer",
  "Only the sender can cancel this offer",
  "Pokemon is not owned by the current user",
  "Pokemon is reserved in an open trade",
  "Requested Pokemon is unavailable",
  "Trade offer not found",
]);

const GENERIC_TRANSFER_ERROR =
  "The transfer could not be completed. Please try again.";

export function getPublicTransferError(message: string) {
  return PUBLIC_TRANSFER_ERRORS.has(message) ? message : GENERIC_TRANSFER_ERROR;
}
