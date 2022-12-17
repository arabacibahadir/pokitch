import { pokes } from "@/storage/data";
import supabase from "@/utils/supabase";

class Poke {
  private cooldowns = Array();

  randPoke = () => {
    const index = Math.floor(Math.random() * pokes.length - 1);
    return pokes[index];
  };

  damage = () => {
    return (Math.floor(Math.random() * 10) + 5) as number;
  };

  sendMessage = async (client: any, channel: string, message: string) => {
    await client.say(channel, message);
    console.log(message);
  };

  setPlayerCooldown = (user: string) => {
    return this.cooldowns.push({ user: user, expires_at: Date.now() + 1000 });
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
      .from("active_pokes")
      .select()
      .eq("channel", channel)
      .single();
    if (data) return;

    await supabase.from("active_pokes").insert({
      channel: channel,
      poke: this.randPoke(),
    });
  };

  // !poke welcomepack
  welcomePack = async (client: any, user: string, channel: string) => {
    if (this.isPlayerOnCooldown(user)) return;
    this.setPlayerCooldown(user);

    const { data: collections } = await supabase
      .from("collections")
      .select()
      .eq("user", user)
      .eq("channel", channel);
    if (collections?.length) return;

    const poke = this.randPoke();
    await supabase.from("collections").insert({
      user: user,
      poke: poke,
      channel: channel,
    });

    this.sendMessage(
      client,
      channel,
      `poke: welcome pack sended -> user: ${user} - poke: ${poke} - channel: ${channel}`
    );
  };

  // !poke inventory
  inventory = async (client: any, user: string, channel: string) => {
    client.say(channel, `@user`);
  };

  // !poke attack
  attack = async (client: any, user: string, channel: string) => {
    if (this.isPlayerOnCooldown(user)) return;
    this.setPlayerCooldown(user);

    const { data } = await supabase
      .from("active_pokes")
      .select()
      .eq("channel", channel)
      .single();

    const damage = this.damage();
    const newHealth = (data.health - damage) as number;
    await supabase
      .from("active_pokes")
      .update({ health: newHealth })
      .eq("id", data.id);

    this.sendMessage(
      client,
      channel,
      `poke: attacking to poke -> user: ${user} - poke: ${data.poke}(${newHealth}) - attack: ${damage} - channel: ${channel}`
    );

    if (newHealth <= 0) {
      await supabase.from("collections").insert({
        user: user,
        channel: channel,
        poke: data.poke,
      });

      await supabase.from("active_pokes").delete().eq("id", data.id);

      this.sendMessage(
        client,
        channel,
        `poke: caught to poke -> user: ${user} - poke: ${data.poke} - channel: ${channel}`
      );

      // generate new poke
      return this.initialize(channel);
    }
  };
}

export const poke = new Poke();
