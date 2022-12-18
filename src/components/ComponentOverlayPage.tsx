/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import Heading from "@/components/ui/Heading";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

type Props = {
  channel: string;
};

const getPokeHealthPercent = (health: number) => {
  return (health * 2 + "%") as string;
};

export default function ComponentOverlayPage({ channel }: Props) {
  const [pokeState, setPokeState] = useState<{
    health: number;
    name: string | null;
  }>({
    health: 0,
    name: null,
  });

  const getCurrentPoke = async (channel: string) => {
    await new Promise<void>(() => setTimeout(async () => {
      const {data} = await supabase
          .from("active_pokes")
          .select()
          .eq("channel", channel)
          .single();
      if (!data) return null;
      setPokeState({...pokeState, health: data.health, name: data.poke});
    }, 1000));
  };

  useEffect(() => {
    getCurrentPoke(channel);

    // realtime subscription on supabase
    const filters = new URLSearchParams({
      channel: "eq." + channel,
    }).toString();
    const subs = supabase
      .channel("public:active_pokes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // check inserts
          schema: "public",
          table: "active_pokes",
          filter: filters,
        },
        () => getCurrentPoke(channel)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // check attacks
          schema: "public",
          table: "active_pokes",
          filter: filters,
        },
        () => getCurrentPoke(channel)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subs);
    };
  }, [channel]);

  if (!pokeState.name) {
    return <></>;
  }

  return (
    <>
      <div className="inline-flex w-full max-w-xs flex-row items-center justify-start gap-x-2 rounded-md border-2 border-yellow-400/50 bg-neutral-900/95 p-3">
        <figure className="inline-block h-12 w-12 shrink-0 items-start justify-center overflow-hidden">
          <img
            src={`https://projectpokemon.org/images/normal-sprite/${pokeState.name}.gif`}
            alt=""
          />
        </figure>
        <div className="ml-2 w-full space-y-2 text-white">
          <div className="flex flex-row items-center justify-between">
            <Heading variant="h5">{pokeState.name}</Heading>
            <span className="text-end text-sm font-light">
              {pokeState.health <= 0 ? 0 : pokeState.health}/50
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-md bg-neutral-600">
            <div
              className="min-h-full bg-yellow-600 transition-width duration-1000"
              style={{ width: getPokeHealthPercent(pokeState.health) }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
