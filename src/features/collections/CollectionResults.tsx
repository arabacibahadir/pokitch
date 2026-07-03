import Image from "next/image";
import Link from "next/link";

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
  formatCatchDate,
  getPokemonSpriteUrl,
} from "@/features/pokemon/presentation";

import type { CollectionRow } from "./types";

export function CollectionResults({
  rows,
  view,
  offset,
}: {
  rows: CollectionRow[];
  view: "grid" | "table";
  offset: number;
}) {
  return view === "grid" ? (
    <CollectionGrid rows={rows} />
  ) : (
    <CollectionTable rows={rows} offset={offset} />
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
              className="media-surface group grid min-h-36 place-items-center gap-2 border-2 border-border p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                unoptimized
                src={getPokemonSpriteUrl(row.poke)}
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

function CollectionTable({
  rows,
  offset,
}: {
  rows: CollectionRow[];
  offset: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
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
                {offset + index + 1}
              </TableCell>
              <TableCell>
                <Link
                  className="inline-flex items-center gap-2 font-semibold capitalize hover:text-primary"
                  href={`/pokemon/${encodeURIComponent(row.poke)}`}
                >
                  <Image
                    unoptimized
                    src={getPokemonSpriteUrl(row.poke)}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 object-contain [image-rendering:pixelated]"
                  />
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
                {formatCatchDate(row.created_at)}
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
        {row.channel} · {formatCatchDate(row.created_at)}
      </p>
    </div>
  );
}
