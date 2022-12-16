import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
  randPoke = () => {
    const index = Math.floor(Math.random() * pokes.length - 1);
    return pokes[index];
  };

  initialize = async (channel: string) => {
    const { data } = await supabase
      .from("channels")
      .select()
      .eq("channel", channel)
      .single();
    if (data) return;

    await supabase.from("channels").insert({
      channel: channel,
      poke: this.randPoke(),
    });
  };

  // !poke welcomepack
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

  inventory = async (user: string, channel: string) => {
    /* const { data: pokes } = await supabase
      .from("collections")
      .select()
      .eq("user", user)
      .eq("channel", channel);
    return pokes; */
    return null;
  };

  // !poke attack
  attack = async (user: string, channel: string) => {
    const damage = Math.floor(Math.random() * 10) + 5;

    const { data } = await supabase
      .from("channels")
      .select()
      .eq("channel", channel)
      .single();

    const newHealth = (data.hp -= damage) as number;
    if (newHealth <= 0) {
      await supabase.from("collections").insert({
        user: user,
        channel: channel,
        poke: data.poke,
      });

      await supabase.from("channels").delete().eq("id", data.id);

      console.log(
        `poke: caught to poke -> poke: ${data.poke} - user: ${user} - channel: ${channel}`
      );

      // generate new poke
      return this.initialize(channel);
    }

    await supabase.from("channels").update({ hp: newHealth }).eq("id", data.id);

    console.log(
      `poke: attacking to poke -> poke: ${data.poke}(${data.hp}) - user: ${user} - attack: ${damage} - channel: ${channel}`
    );
  };
}

export const poke = new Poke();
