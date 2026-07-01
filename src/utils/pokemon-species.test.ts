import { describe, expect, it } from "vitest";

import {
  extractPokemonSpeciesNames,
  isKnownPokemonName,
  normalizeSpeciesCount,
  pickPokemonSpeciesName,
} from "./pokemon-species";

describe("Pokemon species request bounds", () => {
  it("caps provider-controlled counts", () => {
    expect(normalizeSpeciesCount(50_000)).toBe(2_000);
    expect(normalizeSpeciesCount(-1)).toBe(1);
    expect(normalizeSpeciesCount("invalid")).toBeGreaterThan(0);
  });

  it("accepts only names from the supported species set", () => {
    expect(isKnownPokemonName("pikachu")).toBe(true);
    expect(isKnownPokemonName("random-valid-looking-name")).toBe(false);
  });
});

describe("extractPokemonSpeciesNames", () => {
  it("extracts canonical species names from PokeAPI list responses", () => {
    expect(
      extractPokemonSpeciesNames({
        count: 1025,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon-species/1/",
          },
          {
            name: "miraidon",
            url: "https://pokeapi.co/api/v2/pokemon-species/1008/",
          },
        ],
      }),
    ).toEqual(["bulbasaur", "miraidon"]);
  });

  it("ignores malformed species entries", () => {
    expect(
      extractPokemonSpeciesNames({
        count: 2,
        results: [{ name: "pikachu" }, { name: "" }, {}, null],
      }),
    ).toEqual(["pikachu"]);
  });
});

describe("pickPokemonSpeciesName", () => {
  it("picks a deterministic species with an injected random function", () => {
    expect(pickPokemonSpeciesName(["bulbasaur", "mew"], () => 0.99)).toBe(
      "mew",
    );
  });

  it("falls back when no species names are available", () => {
    expect(pickPokemonSpeciesName([], () => 0)).toBe("pikachu");
  });
});
