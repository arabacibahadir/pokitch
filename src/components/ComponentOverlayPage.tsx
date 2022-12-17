import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";

type Props = {
  id: string;
};

export default function ComponentOverlayPage({ id }: Props) {
  const [pokeState, setPokeState] = useState<any>([]);

  // realtime subscription on supabase
  useEffect(() => {
    const channel = supabase
      .channel("public:channels")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "channels" },
        (payload) => setPokeState((state: any) => [...state, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {JSON.stringify(
        pokeState.filter((data: any) => data.channel === id),
        null,
        2
      )}
    </div>
  );
}
