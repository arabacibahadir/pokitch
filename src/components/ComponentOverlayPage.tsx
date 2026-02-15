/* eslint-disable @next/next/no-img-element */

import Heading from "@/ui/Heading";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

type Props = {
  channel: string;
};

const getPokeHealthPercent = (health: number) => {
  const clampedHealth = Math.max(0, Math.min(health, 50));
  return `${clampedHealth * 2}%`;
};

export default function ComponentOverlayPage({ channel }: Props) {
  const [pokeState, setPokeState] = useState<{
    health: number;
    name: string | null;
  }>({
    health: 0,
    name: null,
  });

  const getCurrentPoke = useCallback(async () => {
    const { data } = await supabase
      .from("active_pokes")
      .select("health, poke")
      .eq("channel", channel)
      .single();

    if (!data) {
      setPokeState({
        health: 0,
        name: null,
      });
      return;
    }

    setPokeState({
      health: data.health,
      name: data.poke,
    });
  }, [channel]);

  useEffect(() => {
    void getCurrentPoke();
  }, [getCurrentPoke]);

  // realtime subscription on supabase
  useEffect(() => {
    const filters = new URLSearchParams({
      channel: "eq." + channel,
    }).toString();

    const subs = supabase
      .channel(`active_pokes:${channel}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", filter: filters },
        () => void getCurrentPoke(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", filter: filters },
        () => void getCurrentPoke(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subs);
    };
  }, [channel, getCurrentPoke]);

  if (!pokeState.name) {
    return <></>;
  }

  return (
    <>
      <div className="inline-flex w-full max-w-[16rem] flex-row items-center justify-start gap-x-2 rounded-md border-2 border-yellow-400/50 bg-neutral-900/95 p-3">
        <figure className="inline-flex h-12 w-12 shrink-0">
          <img
            src={`https://projectpokemon.org/images/normal-sprite/${pokeState.name}.gif`}
            alt=""
            style={{
              objectFit: "contain",
              objectPosition: "center",
            }}
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
