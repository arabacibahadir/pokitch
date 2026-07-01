import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CollectionsView } from "@/features/collections/CollectionsView";
import { getCollections } from "@/features/collections/queries";
import {
  type CollectionFilterMode,
  normalizeCollectionQuery,
} from "@/utils/collections";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const filter = normalizeCollectionQuery(query);
  const view = query.view === "table" ? "table" : "grid";
  const { rows, nextCursor } = await getCollections(filter);

  return (
    <section className="container grid gap-6 py-10 tablet:py-14">
      <div className="flex flex-col gap-2">
        <p className="game-kicker">Community archive</p>
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-end tablet:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight tablet:text-5xl">
              {filter.q ? `Results for “${filter.q}”` : "Latest catches"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore recent Pokémon catches without loading the entire archive.
            </p>
          </div>
          <CollectionFilters filter={filter} />
        </div>
      </div>

      <CollectionsView
        key={`${filter.mode ?? "all"}:${filter.q}:${filter.perPage}`}
        rows={rows}
        nextCursor={nextCursor}
        filter={filter}
        view={view}
      />
    </section>
  );
}

function CollectionFilters({
  filter,
}: {
  filter: ReturnType<typeof normalizeCollectionQuery>;
}) {
  return (
    <form
      action="/collections"
      className="game-panel grid gap-2 p-2 tablet:grid-cols-[120px_220px_auto_auto]"
    >
      <select
        name="mode"
        defaultValue={filter.mode ?? "user"}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {(["user", "channel", "poke"] as CollectionFilterMode[]).map((mode) => (
          <option key={mode} value={mode}>
            {mode[0].toUpperCase() + mode.slice(1)}
          </option>
        ))}
      </select>
      <input
        type="search"
        name="q"
        defaultValue={filter.q}
        placeholder="Exact name"
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      <select
        name="perPage"
        defaultValue={String(filter.perPage)}
        aria-label="Items per page"
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="24">24</option>
        <option value="48">48</option>
        <option value="96">96</option>
      </select>
      <div className="flex gap-2">
        <Button className="flex-1" type="submit">
          Search
        </Button>
        {filter.q ? (
          <Button asChild variant="ghost">
            <Link href="/collections">Clear</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
