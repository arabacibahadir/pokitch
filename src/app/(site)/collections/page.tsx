import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionsView } from "@/features/collections/CollectionsView";
import { getCollections } from "@/features/collections/queries";
import {
  buildCollectionsHref,
  type CollectionFilterMode,
  normalizeCollectionQuery,
} from "@/utils/collections";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filter = normalizeCollectionQuery(await searchParams);
  const { rows, globalCount, filteredCount, totalPages } =
    await getCollections(filter);

  if (filteredCount > 0 && filter.page > totalPages) {
    redirect(buildCollectionsHref({ ...filter, page: totalPages }));
  }

  return (
    <section className="container grid gap-6 py-10 tablet:py-14">
      <div className="flex flex-col gap-3">
        <p className="game-kicker">Community archive</p>
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-end tablet:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight tablet:text-5xl">
                {filter.q ? `Results for “${filter.q}”` : "Latest catches"}
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore recent Pokémon catches by trainer, channel, or Pokémon.
            </p>
          </div>
          <CollectionFilters filter={filter} />
        </div>
      </div>

      <CollectionsView rows={rows} filter={filter} totalPages={totalPages} />
    </section>
  );
}

function CollectionFilters({
  filter,
}: {
  filter: ReturnType<typeof normalizeCollectionQuery>;
}) {
  return (
    <form action="/collections" className="game-panel p-3">
      <input type="hidden" name="view" value={filter.view} />
      <FieldGroup className="grid gap-3 tablet:grid-cols-[130px_220px_110px_70px_auto]">
        <Field>
          <FieldLabel htmlFor="collection-mode">Search by</FieldLabel>
          <Select name="mode" defaultValue={filter.mode ?? "user"}>
            <SelectTrigger id="collection-mode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(["user", "channel", "poke"] as CollectionFilterMode[]).map(
                  (mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode[0].toUpperCase() + mode.slice(1)}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="collection-query">Exact name</FieldLabel>
          <Input
            id="collection-query"
            type="search"
            name="q"
            defaultValue={filter.q}
            placeholder="e.g. pikachu"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="collection-page-size">Per page</FieldLabel>
          <Select name="perPage" defaultValue={String(filter.perPage)}>
            <SelectTrigger id="collection-page-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[24, 48, 96].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="collection-view">View</FieldLabel>
          <div className="flex h-9 items-center gap-0.5 rounded-lg border border-border bg-muted/45 p-1 w-[60px]">
            <Button
              asChild
              size="icon-xs"
              variant={filter.view === "grid" ? "secondary" : "ghost"}
            >
              <Link
                aria-label="Grid view"
                href={buildCollectionsHref({ ...filter, page: 1, view: "grid" })}
              >
                <LayoutGrid className="size-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="icon-xs"
              variant={filter.view === "table" ? "secondary" : "ghost"}
            >
              <Link
                aria-label="Table view"
                href={buildCollectionsHref({ ...filter, page: 1, view: "table" })}
              >
                <List className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Field>
        <Field className="justify-end">
          <FieldLabel className="sr-only">Search actions</FieldLabel>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {filter.q ? (
              <Button asChild variant="ghost">
                <a href="/collections">Clear</a>
              </Button>
            ) : null}
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
