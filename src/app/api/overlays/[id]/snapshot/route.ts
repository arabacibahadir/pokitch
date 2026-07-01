import { NextResponse } from "next/server";

import { getActivePoke, getOverlayChannel } from "@/features/overlay/queries";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const channel = await getOverlayChannel(id);
    if (!channel) {
      return NextResponse.json({ error: "Overlay not found" }, { status: 404, headers: NO_STORE });
    }

    const poke = await getActivePoke(channel);
    return NextResponse.json(
      poke
        ? { poke: poke.poke, health: poke.health, updatedAt: poke.updatedAt ?? null }
        : { poke: null, health: null, updatedAt: null },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json({ error: "Overlay not found" }, { status: 404, headers: NO_STORE });
  }
}
