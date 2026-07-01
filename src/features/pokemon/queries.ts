import { cache } from "react";

import {
  getPokemonSpeciesNames,
  isKnownPokemonName,
} from "@/utils/pokemon-species";

import { mapPokemonResponse, type PokemonDetail } from "./model";

const POKEMON_NAME = /^[a-z0-9-]{1,40}$/;

export const getPokemonDetail = cache(
  async (rawName: string): Promise<PokemonDetail | null> => {
    const name = rawName.toLowerCase();
    if (!POKEMON_NAME.test(name)) return null;

    const species = new Set(await getPokemonSpeciesNames());
    if (!isKnownPokemonName(name, species)) return null;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`PokeAPI request failed: ${response.status}`);
    }

    return mapPokemonResponse(await response.json());
  },
);
