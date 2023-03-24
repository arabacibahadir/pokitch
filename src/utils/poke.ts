import { getBaseUrl } from "@/components/UserHeroHomePage";
import { pokes } from "@/storage/data";
import { supabase } from "@/utils/supabase";

class Poke {
  private cooldowns = Array();

  randPoke = () => pokes[Math.floor(Math.random() * pokes.length)];

  damage = () => {
    return Math.floor(Math.random() * 10) + 5;
  };

  sendMessage = async (client: any, channel: string, message: string) => {
    await client.say(channel, message.toString());
    //console.log(message);
  };

  setPlayerCooldown = (user: string) => {
    return this.cooldowns.push({ user: user, expires_at: Date.now() + 31000 });
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
      `${"@" + user} has won ${poke} as a welcome pack!`
    );
  };

  // !poke inventory
  inventory = async (client: any, user: string, channel: string) => {
    if (this.isPlayerOnCooldown(user)) return;
    this.setPlayerCooldown(user);

    const url = getBaseUrl() + "/collections/?user=" + user;
    console.log(url);

    this.sendMessage(client, channel, `@${user}'s inventory: ${url}`);
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
      `Attack by ${"@" + user}. Hit: ${damage}`
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
        `Caught ${data.poke} by ${"@" + user}.`
      );

      // generate new poke
      return this.initialize(channel);
    }
  };
}

export const poke = new Poke();
