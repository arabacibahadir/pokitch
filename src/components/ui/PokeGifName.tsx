import React from "react";

type IPokemonItemProps = {
  pokemon: any;
  selectedPokemonName: string;
  onClick: () => void;
};

export const PokeGifName: React.FC<IPokemonItemProps> = ({
  pokemon,
  selectedPokemonName,
  onClick,
}) => {
  return (
    <div
      className="flex items-center"
      onClick={() => {
        onClick();
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
