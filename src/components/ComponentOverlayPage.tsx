/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import Heading from "./ui/Heading";

type Props = {
  id: string;
};

export default function ComponentOverlayPage({ id }: Props) {
  const [pokeState, setPokeState] = useState<any>({
    health: 0,
    name: null,
  });

  const getCurrentPoke = async (channel: string) => {
    const { data } = await supabase
      .from("channels")
      .select()
      .eq("channel", channel)
      .single();
    if (!data) return null;

    setPokeState({ ...pokeState, health: data.hp, name: data.poke });
  };
  // realtime subscription on supabase
  useEffect(() => {
    const filter = new URLSearchParams({ channel: "eq." + id }).toString();

    getCurrentPoke(id);

    const channel = supabase
      .channel("public:channels")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channels",
          filter: filter,
        },
        () => getCurrentPoke(id)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channels",
          filter: filter,
        },
        () => getCurrentPoke(id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <>
      <div className="inline-flex w-full max-w-xs flex-row items-center justify-start gap-x-2 rounded-md border-4 border-yellow-400/50 bg-neutral-900/100 p-2">
        <figure className="inline-flex h-12 w-12 shrink-0 items-center justify-center">
          <img
            src={`https://projectpokemon.org/images/normal-sprite/${pokeState.name}.gif`}
            alt=""
          />
        </figure>
        <div className="ml-2 w-full space-y-1.5 text-white">
          <Heading className="flex flex-row items-center justify-between">
            <span>{pokeState.name}</span>
            <span className="text-end text-sm font-light">
              {pokeState.health <= 0 ? 0 : pokeState.health}/50
            </span>
          </Heading>
          <div className="h-2 w-full overflow-hidden rounded-md bg-neutral-900/50">
            <div
              className="min-h-full bg-yellow-600 transition-width duration-1000"
              style={{ width: pokeState.health * 2 + "%" }}
            />
          </div>
        </div>
      </div>

      {/* <div>{JSON.stringify(pokeState, null, 2)}</div> */}
    </>
  );
}
