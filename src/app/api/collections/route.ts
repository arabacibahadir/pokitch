import { NextRequest, NextResponse } from "next/server";

import { getCollections } from "@/features/collections/queries";
import { normalizeCollectionQuery } from "@/utils/collections";

export async function GET(request: NextRequest) {
  const filter = normalizeCollectionQuery(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  return NextResponse.json(await getCollections(filter));
}
