import { pokes } from "../storage/data";

type PokeApiListResponse = {
  count?: number;
  results?: unknown[];
};

type SpeciesEntry = {
  name?: unknown;
};

const SPECIES_ENDPOINT = "https://pokeapi.co/api/v2/pokemon-species";
const FALLBACK_POKEMON = "pikachu";
const MAX_SPECIES = 2_000;
const FETCH_TIMEOUT_MS = 8_000;
const fallbackSpecies = new Set(pokes);

let speciesCache: string[] | null = null;

export function normalizeSpeciesCount(value: unknown) {
  const count = Number(value);
  if (!Number.isFinite(count)) {
    return Math.min(pokes.length, MAX_SPECIES);
  }
  return Math.min(MAX_SPECIES, Math.max(1, Math.floor(count)));
}

export function isKnownPokemonName(
  name: string,
  species: ReadonlySet<string> = fallbackSpecies,
) {
  return species.has(name.toLowerCase());
}

export function extractPokemonSpeciesNames(response: PokeApiListResponse) {
  if (!Array.isArray(response.results)) {
    return [];
  }

  return response.results
    .map((entry) => (entry as SpeciesEntry | null)?.name)
    .filter((name): name is string => typeof name === "string" && name !== "");
}

export function pickPokemonSpeciesName(
  speciesNames: string[],
  random = Math.random,
) {
  if (!speciesNames.length) {
    return FALLBACK_POKEMON;
  }

  const index = Math.min(
    speciesNames.length - 1,
    Math.floor(random() * speciesNames.length),
  );

  return speciesNames[index];
}

export async function getPokemonSpeciesNames() {
  if (speciesCache) {
    return speciesCache;
  }

  try {
    const countResponse = await fetch(`${SPECIES_ENDPOINT}?limit=1`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const countData = (await countResponse.json()) as PokeApiListResponse;
    const limit = normalizeSpeciesCount(countData.count);
    const speciesResponse = await fetch(`${SPECIES_ENDPOINT}?limit=${limit}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const speciesData = (await speciesResponse.json()) as PokeApiListResponse;
    const speciesNames = extractPokemonSpeciesNames(speciesData);

    speciesCache = speciesNames.length ? speciesNames : pokes;
  } catch {
    speciesCache = pokes;
  }

  return speciesCache;
}

export async function getRandomPokemonSpeciesName(random = Math.random) {
  const speciesNames = await getPokemonSpeciesNames();

  return pickPokemonSpeciesName(speciesNames, random);
}

export function clearPokemonSpeciesCache() {
  speciesCache = null;
}
