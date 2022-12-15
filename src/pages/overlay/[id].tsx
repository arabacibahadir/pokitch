import { poke } from "@/utils/poke";
import { tmiClient } from "@/utils/tmi";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export default function GameOverlay({ id }: { id: string }) {
  const [pokeState, setPokeState] = useState<{
    hp: number;
    name: string | null;
  }>({
    hp: 0,
    name: null,
  });

  // connect twitch irc server with tmijs
  tmiClient.connect();

  /* useEffect(() => {
    return () => {
      tmiClient.disconnect();
      tmiClient.removeAllListeners();
    };
  }, []); */

  useEffect(() => {
    const interval = setInterval(() => {
      setPokeState({ ...pokeState, hp: poke.hp, name: poke.name });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // if connected to irc server
  tmiClient
    .on("connected", (address) => {
      console.log(`tmi: connected to irc server(${address})`);
      tmiClient.join(id).then(() => {
        poke.initialize();
      });
    })
    .on("disconnected", () => {
      console.log("tmi: disconnected to irc server");
    })
    .on("chat", async (channel, tags, message) => {
      if (!message.startsWith("!poke")) return;

      const cmd = message.slice(1).split(" ").pop()?.toLowerCase();
      const user = tags.username as string;

      // commands
      if (cmd === "welcomepack") {
        console.log(user, cmd);
        return await poke.welcomePack(user, channel);
      } else if (cmd === "attack") {
        return poke.attack(user, channel);
      }
    });

  return <div>{JSON.stringify(pokeState)}</div>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id as string;

  return {
    props: {
      id: id,
    },
  };
};
