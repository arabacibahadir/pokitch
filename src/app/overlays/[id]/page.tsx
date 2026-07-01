import { notFound } from "next/navigation";

import ComponentOverlayPage from "@/components/ComponentOverlayPage";
import {
  getActivePoke,
  getOverlayChannel,
} from "@/features/overlay/queries";
import { parseOverlaySize } from "@/features/overlay/model";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ debug?: string; size?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  let channel: string | null = null;

  try {
    channel = await getOverlayChannel(id);
  } catch {
    notFound();
  }

  if (!channel) {
    notFound();
  }

  const initialPoke = await getActivePoke(channel);

  return (
    <ComponentOverlayPage
      channel={channel}
      debug={query.debug === "1"}
      initialPoke={initialPoke}
      overlayId={id}
      size={parseOverlaySize(query.size)}
    />
  );
}
