type PokeApiResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

export type PokemonDetail = {
  id: number;
  name: string;
  image: string;
  heightMeters: number;
  weightKilograms: number;
  abilities: string[];
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};

export function mapPokemonResponse(response: PokeApiResponse): PokemonDetail {
  const stats = new Map(
    response.stats.map((item) => [item.stat.name, item.base_stat]),
  );

  return {
    id: response.id,
    name: response.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${response.id}.png`,
    heightMeters: response.height / 10,
    weightKilograms: response.weight / 10,
    abilities: response.abilities.map((item) => item.ability.name),
    types: response.types.map((item) => item.type.name),
    stats: {
      hp: stats.get("hp") ?? 0,
      attack: stats.get("attack") ?? 0,
      defense: stats.get("defense") ?? 0,
      specialAttack: stats.get("special-attack") ?? 0,
      specialDefense: stats.get("special-defense") ?? 0,
      speed: stats.get("speed") ?? 0,
    },
  };
}
