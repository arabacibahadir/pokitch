import { NextResponse } from "next/server";

import { getOverlayChannel } from "@/features/overlay/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let channel: string | null;
  try {
    channel = await getOverlayChannel(id);
  } catch {
    return NextResponse.json({ message: "Request failed" }, { status: 500 });
  }
  if (!channel) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({ id, channel });
}
