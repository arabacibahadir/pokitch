import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
  hp: number;
  name: string | null;

  constructor() {
    this.hp = 50;
    this.name = null;
  }

  randPoke = () => {
    const index = Math.floor(Math.random() * pokes.length - 1);
    const pickPoke = pokes[index];

    return pickPoke;
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

  initialize = () => {
    this.hp = 50;
    this.name = this.randPoke();
  };

  attack = async (user: string, channel: string) => {
    const attack = Math.floor(Math.random() * 10) + 5;
    this.hp = this.hp -= attack;
    console.log(
      `poke: attacking to poke -> poke: ${this.hp} - user: ${user} - attack: ${attack} - channel: ${channel}`
    );

    if (this.hp <= 0) {
      const newPoke = this.randPoke();

      console.log(
        `poke: cathed to poke -> poke: ${this.name} - user: ${user} - channel: ${channel}`
      );

      await supabase.from("collections").insert({
        user: user,
        channel: channel,
        poke: newPoke,
      });

      this.hp = 50;
      this.name = newPoke;
    }
  };
}

export const poke = new Poke();
