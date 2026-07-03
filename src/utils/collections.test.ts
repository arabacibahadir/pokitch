import { describe, expect, it } from "vitest";

import {
  buildCollectionsHref,
  getPaginationItems,
  normalizeCollectionQuery,
} from "./collections";

describe("normalizeCollectionQuery", () => {
  it("normalizes filters, numbered pages, page size, and view", () => {
    expect(
      normalizeCollectionQuery({
        mode: "channel",
        q: "  poke_chat  ",
        page: "3",
        perPage: "96",
        view: "table",
      }),
    ).toEqual({
      mode: "channel",
      q: "poke_chat",
      page: 3,
      perPage: 96,
      view: "table",
    });
  });

  it("supports legacy user, channel, and poke links", () => {
    expect(normalizeCollectionQuery({ user: "ash" })).toMatchObject({
      mode: "user",
      q: "ash",
    });
    expect(normalizeCollectionQuery({ channel: "Pokemon" })).toMatchObject({
      mode: "channel",
      q: "Pokemon",
    });
    expect(normalizeCollectionQuery({ poke: "pikachu" })).toMatchObject({
      mode: "poke",
      q: "pikachu",
    });
  });

  it("falls back to safe pagination defaults", () => {
    expect(
      normalizeCollectionQuery({
        mode: "bad",
        q: "pikachu",
        page: "-4",
        perPage: "500",
        view: "unexpected",
      }),
    ).toEqual({
      mode: null,
      q: "",
      page: 1,
      perPage: 24,
      view: "grid",
    });
  });
});

describe("buildCollectionsHref", () => {
  it("omits default pagination and view values", () => {
    expect(
      buildCollectionsHref({
        mode: null,
        q: "",
        page: 1,
        perPage: 24,
        view: "grid",
      }),
    ).toBe("/collections");
  });

  it("preserves filters, page size, page, and table view", () => {
    expect(
      buildCollectionsHref({
        mode: "poke",
        q: "sprigatito",
        page: 3,
        perPage: 48,
        view: "table",
      }),
    ).toBe("/collections?mode=poke&q=sprigatito&page=3&perPage=48&view=table");
  });
});

describe("getPaginationItems", () => {
  it("shows all pages for short result sets", () => {
    expect(getPaginationItems(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it("uses a stable window with boundary ellipses", () => {
    expect(getPaginationItems(10, 5)).toEqual([
      1,
      "ellipsis",
      3,
      4,
      5,
      6,
      7,
      "ellipsis",
      10,
    ]);
  });
});
