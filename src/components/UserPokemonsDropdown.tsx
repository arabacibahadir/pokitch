import Dropdown from "@/ui/Dropdown";
import { PokeGifName } from "@/ui/PokeGifName";
import { useMemo, useState } from "react";

type IUserPokemonsDropdownProps = {
  user: any;
  onChange: (selectedUser: string, id: any) => void;
};

export default function UserPokemonsDropdown({
  user,
  onChange,
}: IUserPokemonsDropdownProps) {
  const count = user.pokemonCollection ? user.pokemonCollection.length : 0;
  const [selectedPokemonName, setSelectedPokemonName] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [pokemonID, setPokemonID] = useState("");

  const itemList = useMemo(() => {
    return user.pokemonCollection
      .sort((a: any, b: any) => a.poke.localeCompare(b.poke))
      .map((pokemon: any) => ({
        label: (
          <PokeGifName
            pokemon={pokemon}
            selectedPokemonName={selectedPokemonName}
            onClick={() => {
              setSelectedPokemon(pokemon);
              setSelectedPokemonName(pokemon.poke);
            }}
          />
        ),
        onClick: () => {
          setPokemonID(pokemon.id);
          onChange(pokemon.poke, pokemon.id);
        },
      }));
  }, [
    user.pokemonCollection,
    selectedPokemonName,
    setSelectedPokemon,
    setPokemonID,
    onChange,
  ]);

  const label = selectedPokemonName ? selectedPokemonName : "Select Poke";

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
        <p>Poke not found in collection.</p>
      )}
    </>
  );
}
