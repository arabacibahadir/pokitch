import { NextResponse } from "next/server";

import { getCollectorPokemon } from "@/features/transfers/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const rows = await getCollectorPokemon(name.trim());

  if (!rows) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(rows, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
