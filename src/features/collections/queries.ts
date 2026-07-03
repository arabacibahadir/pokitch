import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  CollectionFilterMode,
  CollectionQueryState,
} from "@/utils/collections";

import type { CollectionRow } from "./types";

const getCachedCollectionCount = unstable_cache(
  async (mode: CollectionFilterMode | "", value: string) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("collections")
      .select("id", { count: "exact", head: true });

    if (mode && value) {
      query = query.eq(mode, value.toLowerCase());
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },
  ["collection-count-v1"],
  { revalidate: 300 },
);

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

  const from = (filter.page - 1) * filter.perPage;
  const to = from + filter.perPage - 1;
  const globalCountPromise = getCachedCollectionCount("", "");
  const filteredCountPromise =
    filter.mode && filter.q
      ? getCachedCollectionCount(filter.mode, filter.q)
      : globalCountPromise;

  const [{ data, error }, globalCount, filteredCount] = await Promise.all([
    rowsQuery.range(from, to),
    globalCountPromise,
    filteredCountPromise,
  ]);

  if (error) throw error;

  return {
    rows: (data ?? []) as CollectionRow[],
    globalCount,
    filteredCount,
    totalPages: Math.max(1, Math.ceil(filteredCount / filter.perPage)),
  };
}
