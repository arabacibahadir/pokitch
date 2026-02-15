import Dropdown from "@/ui/Dropdown";
import { PokeGifName } from "@/ui/PokeGifName";
import { useMemo, useState } from "react";

type IUserPokemonsDropdownProps = {
  user: {
    channel?: string;
    pokemonCollection?: { id: number; poke: string }[];
  };
  onChange: (selectedUser: string, id: number) => void;
};

export default function UserPokemonsDropdown({
  user,
  onChange,
}: IUserPokemonsDropdownProps) {
  const count = user.pokemonCollection?.length ?? 0;
  const [selectedPokemonName, setSelectedPokemonName] = useState("");

  const itemList = useMemo(() => {
    return [...(user.pokemonCollection ?? [])]
      .sort((a, b) => a.poke.localeCompare(b.poke))
      .map((pokemon) => ({
        label: (
          <PokeGifName
            pokemon={pokemon}
            onClick={() => {
              setSelectedPokemonName(pokemon.poke);
            }}
          />
        ),
        onClick: () => {
          onChange(pokemon.poke, pokemon.id);
        },
      }));
  }, [user.pokemonCollection, onChange]);

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
