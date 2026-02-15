import Image from "next/image";
import React from "react";

type IPokemonItemProps = {
  pokemon: { poke: string };
  onClick: () => void;
};

export const PokeGifName: React.FC<IPokemonItemProps> = ({ pokemon, onClick }) => {
  return (
    <div
      className="flex items-center"
      onClick={() => {
        onClick();
      }}
    >
      <Image
        src={`https://projectpokemon.org/images/normal-sprite/${pokemon.poke}.gif`}
        alt={pokemon.poke}
        width={48}
        height={48}
        className="max-h-12 w-12 object-contain object-center"
      />
      <div className="cursor-pointer pl-3">{pokemon.poke}</div>
    </div>
  );
};
