import { createClient } from "@/lib/supabase/server";
import {
  CollectionQueryState,
  decodeCollectionCursor,
  encodeCollectionCursor,
} from "@/utils/collections";

import type { CollectionRow } from "./types";

export async function getCollections(filter: CollectionQueryState) {
  const supabase = await createClient();
  let rowsQuery = supabase
    .from("collections")
    .select("id,poke,user,channel,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (filter.mode && filter.q) {
    rowsQuery = rowsQuery.eq(filter.mode, filter.q.toLowerCase());
  }

  const cursor = decodeCollectionCursor(filter.cursor);
  if (cursor) {
    rowsQuery = rowsQuery.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await rowsQuery.limit(filter.perPage + 1);

  if (error) {
    throw error;
  }

  const fetchedRows = (data ?? []) as CollectionRow[];
  const rows = fetchedRows.slice(0, filter.perPage);
  const lastRow = rows.at(-1);
  const nextCursor =
    fetchedRows.length > filter.perPage && lastRow
      ? encodeCollectionCursor({
          createdAt: lastRow.created_at,
          id: lastRow.id,
        })
      : null;

  return { rows, nextCursor };
}
