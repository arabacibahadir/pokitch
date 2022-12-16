import { connectDetector } from "@/utils/connectDetector";
import { poke } from "@/utils/poke";
import supabase from "@/utils/supabase";
import { tmiClient } from "@/utils/tmi";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export default function GameOverlay({ id }: { id: string }) {
  const [clientConnected, setClientConnected] = useState(false);
  const [pokeState, setPokeState] = useState<any>([]);

  useEffect(() => {
    const connectedChannel = connectDetector.getConnect(id);

    // Check if the client and channel is connected. If not, connect to the server and set the state to true.
    if (!connectedChannel || !clientConnected) {
      tmiClient.connect();
      setClientConnected(true);
    }

    tmiClient
      .on("connected", async (address) => {
        console.log(`tmi: connected to irc server(${address})`);

        if (clientConnected) {
          tmiClient.join(id); // joint to chat
          connectDetector.setConnect(id); // push channel to connectings
          poke.initialize(id); // up to poke
        }
      })
      .on("disconnected", () => {
        console.log("tmi: disconnected to irc server");
      })
      .on("chat", async (channel, tags, message) => {
        if (!message.startsWith("!poke")) return;

        const cmd = message.slice(1).split(" ").pop()?.toLowerCase(); // remove (!) and pick up to last word as command
        const channelName = channel.slice(1) as string; // remove (#) from channel
        const userName = tags.username as string;
        console.log(userName, cmd); // remove

        // commands
        if (cmd === "welcomepack") {
          return await poke.welcomePack(userName, channelName);
        }
        if (cmd === "attack") {
          return await poke.attack(userName, channelName);
        }
      });
  }, [clientConnected]);

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id as string;

  return {
    props: {
      id: id,
    },
  };
};
