const tmi = require("tmi.js");
const { poke } = require("./poke.class");

const tmiClient = tmi.Client({
  channels: [""],
});

tmiClient.on("connected", (address, port) => {
  console.log("Connected", address, port);
});

tmiClient.on("message", (channel, userstate, message, self) => {
  const username = userstate["display-name"];
  const command = message.split(" ").shift().toLocaleLowerCase();

  switch (command) {
    case "!welcomepack":
      console.log("welcome pack");
      poke.player = username;
      const response = poke.welcomePack();
      console.log(response);
      break;
    case "!attack": // WIP
      console.log("attack");
      break;
  }
});

tmiClient.connect();
