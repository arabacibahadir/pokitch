import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
  hp: number;
  name: string | null;

  constructor() {
    this.hp = 0;
    this.name = null;
  }

  initialize = () => {
    this.hp = 50;
    this.name = this.randPoke();
  };

  randPoke = () => {
    const index = Math.floor(Math.random() * pokes.length - 1);
    return pokes[index];
  };

  welcomePack = async (user: string, channel: string) => {
    const { data: checkPack } = await supabase
      .from("collections")
      .select()
      .eq("user", user)
      .eq("channel", channel);
    if (checkPack?.length) return;

    const randPoke = this.randPoke();
    await supabase.from("collections").insert({
      user: user,
      channel: channel,
      poke: randPoke,
    });
  };

  attack = async (user: string, channel: string) => {
    const attack = Math.floor(Math.random() * 10) + 5;
    this.hp -= attack;

    console.log(
      `poke: attacking to poke -> poke: ${this.name}(${this.hp}) - user: ${user} - attack: ${attack} - channel: ${channel}`
    );

    if (this.hp <= 0) {
      await supabase.from("collections").insert({
        user: user,
        channel: channel,
        poke: this.name,
      });

      console.log(
        `poke: cathed to poke -> poke: ${this.name} - user: ${user} - channel: ${channel}`
      );

      // generate new poke
      return this.initialize();
    }
  };
}

export const poke = new Poke();
