import { connectdetector } from "@/utils/connectdetector";
import { useRouter } from "next/router";
import tmi from "tmi.js";

export default function GameOverlay() {
  let router = useRouter();

  let channel = router.query.id as string;

  const tmiClient = new tmi.Client({});

  tmiClient.on("connected", (address, port) => {
    console.log("Connected", address, port);
    connectdetector.connected = channel;

    console.log("connectdetector.connected", connectdetector.connected);
    tmiClient.join(channel);
  });

  tmiClient.on("message", (channel, userstate, message, self) => {
    const username = userstate["display-name"];
    const splitMessage = message.split(" ");
    const command = splitMessage.shift()?.toLocaleLowerCase();

    console.log(username, command);
  });

  if (!connectdetector.checkConnected(channel)) {
    tmiClient.connect();
  }

  return <div>{channel}</div>;
}
