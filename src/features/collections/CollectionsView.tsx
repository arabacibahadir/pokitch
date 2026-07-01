import { LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildCollectionsHref,
  type CollectionQueryState,
} from "@/utils/collections";

import type { CollectionRow } from "./types";

export function CollectionsView({
  rows,
  nextCursor,
  filter,
  view,
}: {
  rows: CollectionRow[];
  nextCursor: string | null;
  filter: CollectionQueryState;
  view: "grid" | "table";
}) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <h2 className="font-semibold">No catches found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try another trainer, channel, or Pokémon name.
        </p>
      </div>
    );
  }

  const baseFilter = { ...filter, cursor: "" };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end gap-1">
        <Button
          asChild
          size="icon"
          variant={view === "grid" ? "secondary" : "ghost"}
        >
          <Link
            aria-label="Grid view"
            href={withView(buildCollectionsHref(baseFilter), "grid")}
          >
            <LayoutGrid className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="icon"
          variant={view === "table" ? "secondary" : "ghost"}
        >
          <Link
            aria-label="Table view"
            href={withView(buildCollectionsHref(baseFilter), "table")}
          >
            <List className="size-4" />
          </Link>
        </Button>
      </div>

      {view === "grid" ? (
        <CollectionGrid rows={rows} />
      ) : (
        <CollectionTable rows={rows} />
      )}

      {nextCursor ? (
        <Button asChild className="mx-auto min-w-36" variant="outline">
          <Link
            href={withView(
              buildCollectionsHref({ ...filter, cursor: nextCursor }),
              view,
            )}
          >
            Next catches
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function CollectionGrid({ rows }: { rows: CollectionRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-4">
      {rows.map((row) => (
        <Card
          key={row.id}
          className="game-panel overflow-hidden border-2 bg-card shadow-none transition-transform hover:-translate-y-1"
        >
          <CardContent className="flex h-full flex-col gap-3 p-3">
            <Link
              href={`/pokemon/${encodeURIComponent(row.poke)}`}
              aria-label={`View ${row.poke} details`}
              className="group grid min-h-36 place-items-center gap-2 border-2 border-border bg-[radial-gradient(circle,oklch(var(--secondary)),oklch(var(--background))_70%)] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                unoptimized
                src={getSpriteUrl(row.poke)}
                alt={`${row.poke} sprite`}
                width={80}
                height={80}
                className="max-h-20 w-auto object-contain [image-rendering:pixelated] transition group-hover:scale-110"
              />
              <span className="font-black capitalize tracking-wide transition group-hover:text-primary">
                {row.poke}
              </span>
            </Link>
            <CollectionMeta row={row} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CollectionTable({ rows }: { rows: CollectionRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Pokémon</TableHead>
            <TableHead>Trainer</TableHead>
            <TableHead className="hidden tablet:table-cell">Channel</TableHead>
            <TableHead className="hidden text-right tablet:table-cell">
              Caught
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link
                  className="font-semibold capitalize hover:text-primary"
                  href={`/pokemon/${encodeURIComponent(row.poke)}`}
                >
                  {row.poke}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/collections?mode=user&q=${encodeURIComponent(row.user)}`}
                  className="hover:text-primary"
                >
                  {row.user}
                </Link>
              </TableCell>
              <TableCell className="hidden tablet:table-cell">
                {row.channel}
              </TableCell>
              <TableCell className="hidden text-right text-xs text-muted-foreground tablet:table-cell">
                {formatDate(row.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CollectionMeta({ row }: { row: CollectionRow }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">
        by{" "}
        <Link
          href={`/collections?mode=user&q=${encodeURIComponent(row.user)}`}
          className="hover:text-foreground"
        >
          {row.user}
        </Link>
      </p>
      <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {row.channel} · {formatDate(row.created_at)}
      </p>
    </div>
  );
}

function withView(href: string, view: "grid" | "table") {
  if (view === "grid") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}view=table`;
}

function getSpriteUrl(poke: string) {
  return `https://projectpokemon.org/images/normal-sprite/${poke}.gif`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
