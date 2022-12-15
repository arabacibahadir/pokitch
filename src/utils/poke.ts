import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
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
}

export const poke = new Poke();
