import { connectdetector } from "@/utils/connectdetector";
import { poke } from "@/utils/poke";
import supabase from "@/utils/supabase";
import { tmiClient } from "@/utils/tmi";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

//export const tmiClient = tmi.Client({ connection: { secure: true } });

export default function GameOverlay({ id }: { id: string }) {
  const [pokeState, setPokeState] = useState<any>([]);
  useEffect(() => {
    if (!connectdetector.checkConnected(id)) {
      tmiClient.connect();
    }

    tmiClient
      .on("connected", (address) => {
        console.log(`tmi: connected to irc server(${address})`);
        tmiClient.join(id);
        connectdetector.connected = id;
        poke.initialize(id);
      })
      .on("disconnected", () => {
        console.log("tmi: disconnected to irc server");
      })
      .on("chat", async (_channel, tags, message) => {
        if (!message.startsWith("!poke")) return;

        const cmd = message.slice(1).split(" ").pop()?.toLowerCase();
        const channel = _channel.slice(1) as string;
        const user = tags.username as string;
        console.log(user, cmd);

        // commands
        if (cmd === "welcomepack") {
          return await poke.welcomePack(user, channel);
        }
        if (cmd === "attack") {
          return await poke.attack(user, channel);
        }
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("public:channels")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "channels" },
        (payload) => setPokeState([...pokeState, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pokeState, setPokeState]);

  return (
    <div>
      {JSON.stringify(pokeState.filter((data: any) => data.channel === id))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id as string;

  return {
    props: {
      id: id,
    },
  };
};
