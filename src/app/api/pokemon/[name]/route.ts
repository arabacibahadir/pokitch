import { NextResponse } from "next/server";

import { getPokemonDetail } from "@/features/pokemon/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const detail = await getPokemonDetail(name);

  if (!detail) {
    return NextResponse.json({ message: "Pokemon not found" }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
