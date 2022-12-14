const { pokeData } = require("./pokeData");

class Poke {
  playerName = "";
  playerData = [];

  set player(username) {
    this.playerName = username;
  }

  get player() {
    return this.playerName;
  }

  welcomePack() {
    const randomPoke = this.randomPoke();

    this.playerData.push({ player: this.player, pokemon: randomPoke });

    return this.playerData;
  }

  randomPoke() {
    const pokeDataIndexLength = pokeData.length - 1;

    const randomIndex = Math.floor(Math.random() * pokeDataIndexLength);

    return pokeData[randomIndex];
  }
}

const poke = new Poke();

module.exports = { poke };
