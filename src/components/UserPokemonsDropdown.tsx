import Dropdown from "@/ui/Dropdown";
import { useState } from "react";

interface IUserPokemonsDropdownProps {
  user: any;
  onChange: (selectedUser: string, id: any) => void;
}

export default function UserPokemonsDropdown({
  user,
  onChange,
}: IUserPokemonsDropdownProps) {
  const count = user.pokemonCollection ? user.pokemonCollection.length : 0;
  const [selectedPokemonName, setSelectedPokemonName] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [pokemonID, setPokemonID] = useState("");

  interface IPokemonItemProps {
    pokemon: any;
    selectedPokemonName: string;
    onClick: () => void;
  }

  const PokemonItem: React.FC<IPokemonItemProps> = ({
    pokemon,
    selectedPokemonName,
    onClick,
  }) => {
    return (
      <div
        className="flex items-center"
        onClick={() => {
          setSelectedPokemonName(pokemon.poke);
          setSelectedPokemon(pokemon);
        }}
      >
        <img
          src={`https://projectpokemon.org/images/normal-sprite/${pokemon.poke}.gif`}
          alt={pokemon.poke}
          className="max-h-12 w-12 object-contain object-center"
        />
        <div className="cursor-pointer pl-3">{pokemon.poke}</div>
      </div>
    );
  };

  const itemList = user.pokemonCollection
    .sort((a: any, b: any) => a.poke.localeCompare(b.poke))
    .map((pokemon: any) => ({
      label: (
        <PokemonItem
          pokemon={pokemon}
          selectedPokemonName={selectedPokemonName}
          onClick={() => {
            setSelectedPokemon(pokemon);
          }}
        />
      ),
      onClick: () => {
        setSelectedPokemon(pokemon.poke);
        setPokemonID(pokemon.id);
        onChange(pokemon.poke, pokemon.id);
      },
    }));

  const label = selectedPokemonName ? selectedPokemonName : "Select Pokemon";

  return (
    <>
      {user.pokemonCollection ? (
        <div>
          <p>
            {user.channel} Collection: {count}
          </p>
          <div className="relative">
            <Dropdown label={label} menuItems={itemList} />
          </div>
        </div>
      ) : (
        <p>No Pokemon found in collection.</p>
      )}
    </>
  );
}
