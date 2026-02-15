import ComponentOverlayPage from "@/components/ComponentOverlayPage";
import { connectDetector } from "@/utils/connectDetector";
import { poke } from "@/utils/poke";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { tmiClient } from "@/utils/tmi";
import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import type { ChatUserstate } from "tmi.js";

type Props = {
  channel: string;
};

export default function GameOverlay({ channel }: Props) {
  const [clientConnected, setClientConnected] = useState<boolean>(false);

  useEffect(() => {
    const connectAndJoin = async () => {
      const readyState = tmiClient.readyState();

      if (!clientConnected) {
        if (readyState === "OPEN" || readyState === "CONNECTING") {
          if (readyState === "OPEN") setClientConnected(true);
          return;
        }

        await tmiClient.connect();
        setClientConnected(true);
        return;
      }

      if (tmiClient.readyState() !== "OPEN") return;
      if (connectDetector.getConnect(channel)) return;

      connectDetector.setConnect(channel);
      await poke.initialize(channel);
      if (!tmiClient.getChannels().includes(`#${channel}`)) {
        await tmiClient.join(channel);
      }
    };

    const onConnected = async (address: string) => {
      console.log(`tmi: connected to irc server(${address})`);

      if (connectDetector.getConnect(channel)) return;

      connectDetector.setConnect(channel);
      await poke.initialize(channel);
      if (!tmiClient.getChannels().includes(`#${channel}`)) {
        await tmiClient.join(channel);
      }
    };

    const onDisconnected = () => {
      console.log("tmi: disconnected to irc server");
      setClientConnected(false);
    };

    const onChat = async (
      channel: string,
      tags: ChatUserstate,
      message: string,
    ) => {
      if (!message.toLowerCase().startsWith("!poke")) return;

      const cmd = message.slice(1).split(" ").pop()?.toLowerCase(); // remove (!) and pick up to last word as command
      const channelName = channel.slice(1) as string; // remove (#) from channel
      const userName = tags.username as string;

      // commands
      if (cmd === "welcomepack" || cmd === "wp") {
        return await poke.welcomePack(tmiClient, userName, channelName);
      } else if (cmd === "attack" || cmd === "a") {
        return await poke.attack(tmiClient, userName, channelName);
      } else if (cmd === "inventory" || cmd === "i") {
        return await poke.inventory(tmiClient, userName, channelName);
      }
    };

    tmiClient.on("connected", onConnected);
    tmiClient.on("disconnected", onDisconnected);
    tmiClient.on("chat", onChat);

    connectAndJoin();

    return () => {
      tmiClient.removeListener("connected", onConnected);
      tmiClient.removeListener("disconnected", onDisconnected);
      tmiClient.removeListener("chat", onChat);
    };
  }, [channel, clientConnected]);

  return <ComponentOverlayPage channel={channel} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const id = ctx.query.id as string;

  const { data } = await supabase
    .from("accounts")
    .select()
    .eq("id", id)
    .single();

  if (!data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      channel: data.channel,
    },
  };
};
