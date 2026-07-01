import { describe, expect, it } from "vitest";

import {
  buildCollectionsHref,
  decodeCollectionCursor,
  encodeCollectionCursor,
  normalizeCollectionQuery,
} from "./collections";

describe("normalizeCollectionQuery", () => {
  it("normalizes canonical mode and query values", () => {
    expect(
      normalizeCollectionQuery({
        mode: "channel",
        q: "  poke_chat  ",
        cursor: "opaque-cursor",
        perPage: "96",
      }),
    ).toEqual({
      mode: "channel",
      q: "poke_chat",
      cursor: "opaque-cursor",
      perPage: 96,
    });
  });

  it("supports legacy user, channel, and poke query links", () => {
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
        cursor: ["first", "ignored"],
        perPage: "500",
      }),
    ).toEqual({
      mode: null,
      q: "",
      cursor: "first",
      perPage: 24,
    });
  });
});

describe("collection cursors", () => {
  it("round-trips an ordered created-at and id cursor", () => {
    const value = {
      createdAt: "2026-06-29T18:00:00.000Z",
      id: "52a9dbb7-8844-4402-8d61-e740583741e5",
    };

    expect(decodeCollectionCursor(encodeCollectionCursor(value))).toEqual(
      value,
    );
  });

  it("rejects malformed and non-UUID cursors", () => {
    expect(decodeCollectionCursor("not-base64-json")).toBeNull();
    expect(
      decodeCollectionCursor(
        Buffer.from(JSON.stringify({ createdAt: "today", id: "1" })).toString(
          "base64url",
        ),
      ),
    ).toBeNull();
  });

  it("rejects parseable but non-canonical cursor timestamps", () => {
    expect(
      decodeCollectionCursor(
        Buffer.from(
          JSON.stringify({
            createdAt: "June 29, 2026",
            id: "52a9dbb7-8844-4402-8d61-e740583741e5",
          }),
        ).toString("base64url"),
      ),
    ).toBeNull();
  });
});

describe("buildCollectionsHref", () => {
  it("omits empty filters and cursors", () => {
    expect(
      buildCollectionsHref({
        mode: null,
        q: "",
        cursor: "",
        perPage: 24,
      }),
    ).toBe("/collections");
  });

  it("builds canonical filtered cursor links", () => {
    expect(
      buildCollectionsHref({
        mode: "poke",
        q: "sprigatito",
        cursor: "next-page",
        perPage: 48,
      }),
    ).toBe("/collections?mode=poke&q=sprigatito&cursor=next-page&perPage=48");
  });
});
