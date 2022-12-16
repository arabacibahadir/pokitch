import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
  public cooldowns = Array();

  randPoke = () => {
    const index = Math.floor(Math.random() * pokes.length - 1);
    return pokes[index];
  };

  damage = () => {
    return (Math.floor(Math.random() * 10) + 5) as number;
  };

  setPlayerCooldown = (user: string, date: number) => {
    return this.cooldowns.push({ user: user, expires_at: date });
  };

  isPlayerOnCooldown = (user: string) => {
    const cooldown = this.cooldowns
      .filter((cooldown) => cooldown.user === user)
      .pop();
    if (!cooldown) return false; // if not have cd

    if (cooldown.expires_at > Date.now()) return true; // if have cd

    return false;
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
    if (this.isPlayerOnCooldown(user)) return;
    this.setPlayerCooldown(user, Date.now() + 30000);

    const { data } = await supabase
      .from("channels")
      .select()
      .eq("channel", channel)
      .single();

    const damage = this.damage();
    const newHealth = (data.hp - damage) as number;
    await supabase.from("channels").update({ hp: newHealth }).eq("id", data.id);

    console.log(
      `poke: attacking to poke -> poke: ${data.poke}(${newHealth}) - user: ${user} - attack: ${damage} - channel: ${channel}`
    );

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
  };
}

export const poke = new Poke();
