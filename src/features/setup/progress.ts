export type SetupProgress = {
  overlayCopied: boolean;
  browserSourceAdded: boolean;
  botModerated: boolean;
};

export const EMPTY_SETUP_PROGRESS: SetupProgress = {
  overlayCopied: false,
  browserSourceAdded: false,
  botModerated: false,
};

export function getSetupStorageKey(accountId: string) {
  return `pokitch:setup:v1:${accountId}`;
}

export function parseSetupProgress(value: string | null): SetupProgress {
  try {
    const parsed = JSON.parse(value ?? "{}") as Partial<SetupProgress>;
    return {
      overlayCopied: parsed.overlayCopied === true,
      browserSourceAdded: parsed.browserSourceAdded === true,
      botModerated: parsed.botModerated === true,
    };
  } catch {
    return EMPTY_SETUP_PROGRESS;
  }
}
