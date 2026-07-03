import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createPublicClient } from "@/lib/supabase/public";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/overlays\/([^/]+)$/);
  if (match && match[1] !== "unavailable") {
    const { data, error } = await createPublicClient().rpc(
      "get_overlay_channel",
      { p_account_id: match[1] },
    );

    if (!error && !data) {
      const unavailableUrl = request.nextUrl.clone();
      unavailableUrl.pathname = "/overlays/unavailable";
      return NextResponse.rewrite(unavailableUrl, { status: 404 });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
