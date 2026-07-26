import { getChannelSyncPlan } from "./commands";

export const CHANNEL_RECONCILE_INTERVAL_MS = 15 * 60 * 1_000;
export const CHANNEL_SYNC_DEBOUNCE_MS = 250;
const TWITCH_JOIN_STAGGER_MS = 600;

export type ChannelSyncHealth = {
  status: "subscribed" | "degraded";
  lastSuccessAt: string | null;
};

type ChannelSynchronizerDependencies = {
  loadDesiredChannels: () => Promise<string[]>;
  getJoinedChannels: () => string[];
  // eslint-disable-next-line no-unused-vars
  join: (channel: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  part: (channel: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  initialize: (channel: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => Date;
  // eslint-disable-next-line no-unused-vars
  onError?: (message: string, error: unknown) => void;
};

const defaultSleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class ChannelSynchronizer {
  private readonly dependencies: Required<ChannelSynchronizerDependencies>;
  private health: ChannelSyncHealth = {
    status: "degraded",
    lastSuccessAt: null,
  };
  private reconcileTimer: ReturnType<typeof setInterval> | undefined;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private inFlight: Promise<void> | null = null;
  private queued = false;
  private stopped = false;

  constructor(dependencies: ChannelSynchronizerDependencies) {
    this.dependencies = {
      ...dependencies,
      sleep: dependencies.sleep ?? defaultSleep,
      now: dependencies.now ?? (() => new Date()),
      onError:
        dependencies.onError ??
        ((message, error) => console.error(message, error)),
    };
  }

  async start() {
    this.stopped = false;
    await this.requestSync();
    if (!this.stopped) {
      this.reconcileTimer = setInterval(() => {
        void this.requestSync().catch((error) =>
          this.dependencies.onError("Channel reconciliation failed:", error),
        );
      }, CHANNEL_RECONCILE_INTERVAL_MS);
    }
  }

  schedule() {
    if (this.stopped) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      void this.requestSync().catch((error) =>
        this.dependencies.onError("Channel synchronization failed:", error),
      );
    }, CHANNEL_SYNC_DEBOUNCE_MS);
  }

  requestSync(): Promise<void> {
    if (this.stopped) return Promise.resolve();
    if (this.inFlight) {
      this.queued = true;
      return this.inFlight;
    }

    const run = async () => {
      do {
        this.queued = false;
        await this.reconcile();
      } while (this.queued && !this.stopped);
    };

    this.inFlight = run().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  async handleSubscriptionStatus(status: string) {
    if (status === "SUBSCRIBED") {
      this.health = { ...this.health, status: "subscribed" };
      await this.requestSync();
      return;
    }

    if (
      status === "CHANNEL_ERROR" ||
      status === "TIMED_OUT" ||
      status === "CLOSED"
    ) {
      this.health = { ...this.health, status: "degraded" };
    }
  }

  getHealth(): ChannelSyncHealth {
    return { ...this.health };
  }

  stop() {
    this.stopped = true;
    if (this.reconcileTimer) clearInterval(this.reconcileTimer);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.reconcileTimer = undefined;
    this.debounceTimer = undefined;
  }

  private async reconcile() {
    const desiredChannels = await this.dependencies.loadDesiredChannels();
    const plan = getChannelSyncPlan(
      desiredChannels,
      this.dependencies.getJoinedChannels(),
    );

    for (const channel of plan.part) {
      try {
        await this.dependencies.part(channel);
      } catch (error) {
        this.dependencies.onError(`Failed to leave channel ${channel}:`, error);
      }
    }

    for (const channel of plan.join) {
      try {
        await this.dependencies.join(channel);
        await this.dependencies.initialize(channel);
      } catch (error) {
        this.dependencies.onError(`Failed to join channel ${channel}:`, error);
      }
      await this.dependencies.sleep(TWITCH_JOIN_STAGGER_MS);
    }

    this.health = {
      ...this.health,
      lastSuccessAt: this.dependencies.now().toISOString(),
    };
  }
}
