const tmi = require("tmi.js");
const { poke } = require("./poke.class");
const {pokeData} = require("./pokeData");

const tmiClient = tmi.Client({
  channels: [""],
});

tmiClient.on("connected", (address, port) => {
  console.log("Connected", address, port);
});

// set random attack between 5 and 10

let hp = 50;
let pokemonName = randomPokemonName();
tmiClient.on("message", (channel, userstate, message, self) => {
  const username = userstate["display-name"];
  const command = message.split(" ").shift().toLocaleLowerCase();
  poke.player = username;
  switch (command) {
    case "!pokemon":
      console.log("This is a pokemon game which is still in development that you can play in the chat.");
      break;

    case "!welcomepack":
      console.log("welcome pack");
      const response = poke.welcomePack();
      console.log(response);
      break;

    case "!attack": // WIP
      console.log("attack");
        let attack = Math.floor(Math.random() * 10) + 5;
        hp -= attack;
        //if hp is less than 0
        if (hp <= 0) {
            //set hp to 0
            let oldPokemonName = pokemonName;
            pokemonName = randomPokemonName();
            hp = 50;
            console.log(oldPokemonName," caught. New pokemon: ", pokemonName);
            // TODO: add pokemon to player's collection
        }
        else {
            console.log(pokemonName, "Hit: ", attack, "pokemon hp:", hp);
        }
      break;

    case "!hp":// get current hp
      console.log(pokemonName, " pokemon hp: ", hp);
      break;

    case "!mypokemons":
      console.log("mypokemons");
      //TODO: show player's pokemons
      break;

    //TODO: add more commands like gift,trade,leaderboard,brawl,pokelevelup

  }
});

function randomPokemonName() {
  const pokeDataIndexLength = pokeData.length - 1;
  const randomIndex = Math.floor(Math.random() * pokeDataIndexLength);
  return pokeData[randomIndex];
}
tmiClient.connect().then(() => console.log("Connected to Twitch"));
