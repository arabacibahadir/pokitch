export type CollectionFilterMode = "user" | "channel" | "poke";

export type CollectionQueryState = {
  mode: CollectionFilterMode | null;
  q: string;
  page: number;
  perPage: number;
  view: "grid" | "table";
};

type QueryValue = string | string[] | undefined;
type QueryInput = Record<string, QueryValue>;

const FILTER_MODE_LIST: CollectionFilterMode[] = ["user", "channel", "poke"];
const FILTER_MODES = new Set<CollectionFilterMode>(FILTER_MODE_LIST);
const PER_PAGE_OPTIONS = new Set([24, 48, 96]);
const DEFAULT_PER_PAGE = 24;

export function normalizeCollectionQuery(
  query: QueryInput,
): CollectionQueryState {
  const canonicalMode = getMode(getFirstValue(query.mode));
  const canonicalQuery = getFirstValue(query.q).trim();
  const legacyFilter = getLegacyFilter(query);
  const page = getPositiveInteger(getFirstValue(query.page), 1);
  const requestedPerPage = getPositiveInteger(
    getFirstValue(query.perPage),
    DEFAULT_PER_PAGE,
  );
  const perPage = PER_PAGE_OPTIONS.has(requestedPerPage)
    ? requestedPerPage
    : DEFAULT_PER_PAGE;
  const view = getFirstValue(query.view) === "table" ? "table" : "grid";

  if (canonicalMode && canonicalQuery) {
    return { mode: canonicalMode, q: canonicalQuery, page, perPage, view };
  }

  if (legacyFilter) {
    return { ...legacyFilter, page, perPage, view };
  }

  return { mode: null, q: "", page, perPage, view };
}

export function buildCollectionsHref(state: CollectionQueryState) {
  const params = new URLSearchParams();

  if (state.mode && state.q) {
    params.set("mode", state.mode);
    params.set("q", state.q);
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }

  if (state.perPage !== DEFAULT_PER_PAGE) {
    params.set("perPage", String(state.perPage));
  }

  if (state.view === "table") {
    params.set("view", "table");
  }

  const query = params.toString();
  return query ? `/collections?${query}` : "/collections";
}

export type PaginationItem = number | "ellipsis";

export function getPaginationItems(
  totalPages: number,
  currentPage: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages]);
  for (
    let page = Math.max(2, currentPage - 2);
    page <= Math.min(totalPages - 1, currentPage + 2);
    page += 1
  ) {
    pages.add(page);
  }

  const ordered = [...pages].sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  for (const page of ordered) {
    const previous = result.at(-1);
    if (typeof previous === "number" && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
}

function getLegacyFilter(query: QueryInput) {
  for (const mode of FILTER_MODE_LIST) {
    const value = getFirstValue(query[mode]).trim();

    if (value) {
      return { mode, q: value };
    }
  }

  return null;
}

function getMode(value: string): CollectionFilterMode | null {
  if (FILTER_MODES.has(value as CollectionFilterMode)) {
    return value as CollectionFilterMode;
  }

  return null;
}

function getPositiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function getFirstValue(value: QueryValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
