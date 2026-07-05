import { notFound } from "next/navigation";

import ComponentOverlayPage from "@/components/ComponentOverlayPage";
import {
  getActivePoke,
  getOverlayChannel,
} from "@/features/overlay/queries";
import { loadOverlay } from "@/features/overlay/loader";
import { parseOverlaySize } from "@/features/overlay/model";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    debug?: string;
    size?: string;
    hideCatch?: string;
    hideAttack?: string;
    primary?: string;
    card?: string;
    text?: string;
    theme?: string;
    hideTicker?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const result = await loadOverlay(id, {
    getChannel: getOverlayChannel,
    getPoke: getActivePoke,
  });
  if (result.status === "missing") notFound();

  return (
    <ComponentOverlayPage
      debug={query.debug === "1"}
      initialPoke={result.initialPoke}
      overlayId={id}
      size={parseOverlaySize(query.size)}
      hideCatch={query.hideCatch === "true" || query.hideCatch === "1"}
      hideAttack={query.hideAttack === "true" || query.hideAttack === "1"}
      primaryColor={query.primary}
      cardColor={query.card}
      textColor={query.text}
      theme={query.theme}
      hideTicker={query.hideTicker === "true" || query.hideTicker === "1"}
    />
  );
}
