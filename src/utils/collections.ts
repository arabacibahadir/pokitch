export type CollectionFilterMode = "user" | "channel" | "poke";

export type CollectionQueryState = {
  mode: CollectionFilterMode | null;
  q: string;
  cursor: string;
  perPage: number;
};

export type CollectionCursor = {
  createdAt: string;
  id: string;
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
  const cursor = getFirstValue(query.cursor).trim().slice(0, 512);
  const requestedPerPage = getPositiveInteger(
    getFirstValue(query.perPage),
    DEFAULT_PER_PAGE,
  );
  const perPage = PER_PAGE_OPTIONS.has(requestedPerPage)
    ? requestedPerPage
    : DEFAULT_PER_PAGE;

  if (canonicalMode && canonicalQuery) {
    return { mode: canonicalMode, q: canonicalQuery, cursor, perPage };
  }

  if (legacyFilter) {
    return { ...legacyFilter, cursor, perPage };
  }

  return { mode: null, q: "", cursor, perPage };
}

export function encodeCollectionCursor(cursor: CollectionCursor) {
  return toBase64Url(JSON.stringify(cursor));
}

export function decodeCollectionCursor(value: string): CollectionCursor | null {
  try {
    const parsed = JSON.parse(
      fromBase64Url(value),
    ) as Partial<CollectionCursor>;
    const createdAt = parsed.createdAt;
    const id = parsed.id;

    if (
      typeof createdAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:z|[+-]\d{2}:\d{2})$/i.test(
        createdAt,
      ) ||
      Number.isNaN(Date.parse(createdAt)) ||
      typeof id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return null;
    }

    return { createdAt: new Date(createdAt).toISOString(), id };
  } catch {
    return null;
  }
}

export function buildCollectionsHref(state: CollectionQueryState) {
  const params = new URLSearchParams();

  if (state.mode && state.q) {
    params.set("mode", state.mode);
    params.set("q", state.q);
  }

  if (state.cursor) {
    params.set("cursor", state.cursor);
  }

  if (state.perPage !== DEFAULT_PER_PAGE) {
    params.set("perPage", String(state.perPage));
  }

  const query = params.toString();
  return query ? `/collections?${query}` : "/collections";
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

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
