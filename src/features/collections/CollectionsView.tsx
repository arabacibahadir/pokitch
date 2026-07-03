import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  buildCollectionsHref,
  type CollectionQueryState,
  getPaginationItems,
} from "@/utils/collections";

import type { CollectionRow } from "./types";
import { CollectionResults } from "./CollectionResults";

export function CollectionsView({
  rows,
  filter,
  totalPages,
}: {
  rows: CollectionRow[];
  filter: CollectionQueryState;
  totalPages: number;
}) {
  const baseFilter = { ...filter, page: 1 };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end gap-1">
        <Button
          asChild
          size="icon"
          variant={filter.view === "grid" ? "secondary" : "ghost"}
        >
          <Link
            aria-label="Grid view"
            href={buildCollectionsHref({ ...baseFilter, view: "grid" })}
          >
            <LayoutGrid />
          </Link>
        </Button>
        <Button
          asChild
          size="icon"
          variant={filter.view === "table" ? "secondary" : "ghost"}
        >
          <Link
            aria-label="Table view"
            href={buildCollectionsHref({ ...baseFilter, view: "table" })}
          >
            <List />
          </Link>
        </Button>
      </div>

      {!rows.length ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <h2 className="font-semibold">No catches found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another trainer, channel, or Pokémon name.
          </p>
        </div>
      ) : (
        <CollectionResults
          rows={rows}
          view={filter.view}
          offset={(filter.page - 1) * filter.perPage}
        />
      )}

      {totalPages > 1 ? (
        <CollectionPagination filter={filter} totalPages={totalPages} />
      ) : null}
    </div>
  );
}

function CollectionPagination({
  filter,
  totalPages,
}: {
  filter: CollectionQueryState;
  totalPages: number;
}) {
  const previous = Math.max(1, filter.page - 1);
  const next = Math.min(totalPages, filter.page + 1);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={filter.page === 1}
            className={
              filter.page === 1 ? "pointer-events-none opacity-50" : ""
            }
            href={buildCollectionsHref({ ...filter, page: previous })}
          />
        </PaginationItem>
        {getPaginationItems(totalPages, filter.page).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={buildCollectionsHref({ ...filter, page: item })}
                isActive={item === filter.page}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            aria-disabled={filter.page === totalPages}
            className={
              filter.page === totalPages ? "pointer-events-none opacity-50" : ""
            }
            href={buildCollectionsHref({ ...filter, page: next })}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
