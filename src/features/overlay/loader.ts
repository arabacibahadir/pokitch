import type { ActivePoke } from "./model";
import type { getActivePoke, getOverlayChannel } from "./queries";

type OverlayDependencies = {
  getChannel: typeof getOverlayChannel;
  getPoke: typeof getActivePoke;
};

export type OverlayLoadResult =
  | { status: "missing" }
  | { status: "ready"; channel: string; initialPoke: ActivePoke | null };

export async function loadOverlay(
  accountId: string,
  dependencies: OverlayDependencies,
): Promise<OverlayLoadResult> {
  const channel = await dependencies.getChannel(accountId);
  if (!channel) return { status: "missing" };

  return {
    status: "ready",
    channel,
    initialPoke: await dependencies.getPoke(channel),
  };
}
