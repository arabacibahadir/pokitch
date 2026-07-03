import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Collection pages"
      data-slot="pagination"
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: "icon",
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious(props: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to previous page"
      className={buttonVariants({ variant: "ghost" })}
      {...props}
    >
      <ChevronLeft data-icon="inline-start" /> Previous
    </a>
  );
}

function PaginationNext(props: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to next page"
      className={buttonVariants({ variant: "ghost" })}
      {...props}
    >
      Next <ChevronRight data-icon="inline-end" />
    </a>
  );
}

function PaginationEllipsis() {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className="flex size-8 items-center justify-center"
    >
      <MoreHorizontal />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
