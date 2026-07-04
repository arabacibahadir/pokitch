import { describe, expect, it } from "vitest";

import { mapPokemonResponse } from "./model";

describe("mapPokemonResponse", () => {
  it("maps the PokeAPI response to the UI DTO", () => {
    expect(
      mapPokemonResponse({
        id: 25,
        name: "pikachu",
        height: 4,
        weight: 60,
        abilities: [{ ability: { name: "static" } }],
        types: [{ type: { name: "electric" } }],
        stats: [
          { base_stat: 35, stat: { name: "hp" } },
          { base_stat: 55, stat: { name: "attack" } },
          { base_stat: 40, stat: { name: "defense" } },
          { base_stat: 50, stat: { name: "special-attack" } },
          { base_stat: 50, stat: { name: "special-defense" } },
          { base_stat: 90, stat: { name: "speed" } },
        ],
      }),
    ).toEqual({
      id: 25,
      name: "pikachu",
      image:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
      heightMeters: 0.4,
      weightKilograms: 6,
      abilities: ["static"],
      types: ["electric"],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
    });
  });
});
