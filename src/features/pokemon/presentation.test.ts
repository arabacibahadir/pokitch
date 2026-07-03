import { describe, expect, it } from "vitest";

import { formatCatchDate, getPokemonSpriteUrl } from "./presentation";

describe("pokemon presentation", () => {
  it("encodes sprite names in the canonical sprite URL", () => {
    expect(getPokemonSpriteUrl("mr mime")).toBe(
      "https://projectpokemon.org/images/normal-sprite/mr%20mime.gif",
    );
  });

  it("formats catch dates consistently in UTC", () => {
    expect(formatCatchDate("2026-07-02T12:30:00.000Z", "en-GB")).toContain(
      "2 Jul",
    );
  });
});
