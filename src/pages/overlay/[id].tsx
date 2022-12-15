import { poke } from "@/utils/poke";
import { tmiClient } from "@/utils/tmi";
import { GetServerSideProps } from "next";
import { useEffect } from "react";

export default function GameOverlay({ id }: { id: string }) {
  // connect twitch irc server with tmijs
  tmiClient.connect();

  useEffect(() => {
    return () => {
      tmiClient.disconnect();
      tmiClient.removeAllListeners();
    };
  }, []);

  // if connected to irc server
  tmiClient
    .on("connected", (address) => {
      console.log(`tmi: connected to irc server(${address})`);
      tmiClient.join(id);
    })
    .on("disconnected", () => {
      console.log("tmi: disconnected to irc server");
    })
    .on("chat", async (channel, tags, message) => {
      if (!message.startsWith("!poke")) return;

      const cmd = message.slice(1).split(" ").pop()?.toLowerCase();
      const user = tags.username as string;

      if (cmd === "welcomepack") {
        console.log(user, cmd);
        return await poke.welcomePack(user, channel);
      }
    });

  return <div></div>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id as string;

  return {
    props: {
      id: id,
    },
  };
};
