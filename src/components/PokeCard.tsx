import { useEffect, useState } from "react";
import { MdCatchingPokemon } from "react-icons/md";

interface Pokemon {
  name: string;
  id: number;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
}
const pokeTypeColors: { [key: string]: string } = {
  normal: "bg-gray-500",
  fire: "bg-red-500",
  water: "bg-blue-700",
  electric: "bg-yellow-600",
  grass: "bg-green-700",
  ice: "bg-blue-500",
  fighting: "bg-red-600",
  poison: "bg-purple-500",
  ground: "bg-green-900",
  flying: "bg-sky-600",
  psychic: "bg-pink-500",
  bug: "bg-green-500",
  rock: "bg-gray-600",
  ghost: "bg-purple-700",
  dragon: "bg-rose-400",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-500",
};

const PokemonCard = (pokename: any) => {
  const [pokemon, setPokemon] = useState<Pokemon>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const getTypeColor = (type: string): string => {
    return pokeTypeColors[type] ?? "bg-gray-500";
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon/" + pokename.poke,
        );
        const data = await response.json();

        const abilities = data.abilities.map(
          (ability: any) => ability.ability.name,
        );

        const stats = {
          hp: data.stats[0].base_stat,
          attack: data.stats[1].base_stat,
          defense: data.stats[2].base_stat,
          spAttack: data.stats[3].base_stat,
          spDefense: data.stats[4].base_stat,
          speed: data.stats[5].base_stat,
        };

        setPokemon({
          name: data.name,
          id: data.id,
          types: data.types.map((type: any) => type.type.name),
          height: data.height,
          weight: data.weight,
          abilities,
          stats,
        });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPokemon();
  }, []);

  return (
    <div className="w-32 rounded-lg bg-amber-800 p-2 shadow-2xl">
      {isLoading ? (
        <div className="text-center">
          <MdCatchingPokemon className="h-6 w-6 animate-spin" />
        </div>
      ) : pokemon ? (
        <>
          <div className="text-center">
            <h2 className="text-xl font-bold"> {pokemon.name}</h2>
            <span className="small"> #{pokemon.id}</span>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
              alt={pokemon.name}
              className="h-30 w-30 mx-auto"
            />
          </div>
          <div className="">
            <p className="text-sm font-bold">Types:</p>
            <ul className="text-sm">
              {pokemon.types.map((type) => (
                <li key={type}>
                  <span
                    className={`${getTypeColor(type)} rounded px-1 text-white`}>
                    {type}
                  </span>
                </li>
              ))}
            </ul>

            <table className="table-auto">
              <tbody>
                <tr>
                  <td className="text-sm font-bold">Height:</td>
                  <td className="text-sm">{pokemon.height}</td>
                </tr>
                <tr>
                  <td className="text-sm font-bold">Weight:</td>
                  <td className="text-sm">{pokemon.weight}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm font-bold">Abilities:</p>
            <ul className="text-sm">
              {pokemon.abilities.map((ability) => (
                <li key={ability}>{ability}</li>
              ))}
            </ul>
            <p className="text-sm font-bold">Stats:</p>

            <ul className="text-sm">
              <li>HP: {pokemon.stats.hp}</li>
              <li>Attack: {pokemon.stats.attack}</li>
              <li>Defense: {pokemon.stats.defense}</li>
              <li>Sp. Attack: {pokemon.stats.spAttack}</li>
              <li>Sp. Defense: {pokemon.stats.spDefense}</li>
              <li>Speed: {pokemon.stats.speed}</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center">Pokemon not found</div>
      )}
    </div>
  );
};

export default PokemonCard;
