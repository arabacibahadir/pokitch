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
    await client.say(channel, message);
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

    const welcomeMessages = [
      `${"@" + user} has won ${poke} as a welcome pack!`,
      `Welcome to the community, ${
        "@" + user
      }! You've won a ${poke} as a prize.`,
      `Congratulations, ${
        "@" + user
      }! You're the lucky winner of a ${poke} welcome pack.`,
      `We're thrilled to have you here, ${
        "@" + user
      }! Enjoy your ${poke} prize as a welcome gift.`,
      `${
        "@" + user
      }, a warm welcome to the community! You've just earned yourself a ${poke} welcome bonus.`,
      `Let's give a warm welcome to ${
        "@" + user
      }, who's won a ${poke} as a greeting gift!`,
      `Welcome aboard, ${
        "@" + user
      }! As a welcome gift, you'll receive a ${poke}.`,
      `${
        "@" + user
      }, we're excited to have you join us! Enjoy your ${poke} welcome package.`,
      `A big congratulations to ${
        "@" + user
      } for winning a ${poke} as a welcome prize!`,
      `It's a pleasure to welcome ${
        "@" + user
      } to the community, with a ${poke} as a welcome reward.`,
      `${
        "@" + user
      }, we're delighted to have you here! Enjoy your ${poke} welcome gift.`,
      `${
        "@" + user
      }, we're excited to have you join us! Enjoy your ${poke} welcome package.`,
    ];
    const welcomeMessage =
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    this.sendMessage(client, channel, welcomeMessage);
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

    const attackMessages = [
      `${"@" + user} lands a hit! Dealt ${damage} damage.`,
      `${"@" + user} strikes with a forceful blow, dealing ${damage} damage.`,
      `Attack initiated by ${"@" + user} Damage dealt: ${damage}.`,
      `${
        "@" + user
      } makes contact with a powerful attack, dealing ${damage} damage.`,
      `A damaging hit from ${"@" + user} ${damage} points deducted.`,
      `${"@" + user} deals ${damage} damage with a swift attack.`,
      `${"@" + user} inflicts ${damage} damage with a well-executed attack.`,
      `An attack from ${"@" + user} connects! ${damage} damage dealt.`,
      `${"@" + user} strikes true, dealing ${damage} points of damage.`,
      `${"@" + user} attacks for ${damage} damage!`,
      `${"@" + user} unleashes an attack, dealing ${damage} damage.`,
      `A devastating blow from ${"@" + user} lands! ${damage} damage dealt.`,
      `${"@" + user} a powerful attack, dealing ${damage} damage.`,
      `Attack incoming from ${"@" + user} ${damage} damage inflicted.`,
      `${"@" + user} deals ${damage} points of damage with a fierce attack.`,
      `${"@" + user} strikes a critical hit! ${damage} damage dealt.`,
      `${"@" + user} inflicts ${damage} damage with a well-placed attack.`,
      `A damaging attack from ${
        "@" + user
      } lands, dealing ${damage} points of damage.`,
      `${"@" + user} strikes with precision, dealing ${damage} damage.`,
      `${"@" + user} launches an attack that lands, dealing ${damage} damage.`,
      `Attack initiated by ${"@" + user} ${damage} damage dealt.`,
      `${"@" + user} hits hard with an attack, dealing ${damage} damage.`,
      `${"@" + user} strikes with a crushing blow for ${damage} damage.`,
      `${
        "@" + user
      } inflicts ${damage} points of damage with a powerful strike.`,
      `${"@" + user} lands a critical attack for ${damage} damage.`,
      `A swift attack from ${"@" + user} connects, dealing ${damage} damage.`,
      `${"@" + user} deals ${damage} damage with a well-timed attack.`,
      `${"@" + user} hits target for ${damage} damage with an attack.`,
      `${"@" + user} deals a solid hit, inflicting ${damage} damage.`,
      `Attack from ${"@" + user} successfully hits for ${damage} damage.`,
    ];
    const randomAttackMessage =
      attackMessages[Math.floor(Math.random() * attackMessages.length)];

    this.sendMessage(client, channel, randomAttackMessage);

    if (newHealth <= 0) {
      await supabase.from("collections").insert({
        user: user,
        channel: channel,
        poke: data.poke,
      });

      await supabase.from("active_pokes").delete().eq("id", data.id);

      const catchtMessages = [
        `${"@" + user} has successfully captured a ${data.poke}!`,
        `A wild ${data.poke} has been caught by ${"@" + user}!`,
        `Congratulations, ${"@" + user} 've added a ${
          data.poke
        } to your collection.`,
        `${"@" + user} is now the proud owner of a new ${data.poke}!`,
        `A round of applause for ${"@" + user} who's caught a ${data.poke}!`,
        `${"@" + user} has just caught a ${data.poke} - great job!`,
        `The hunt is over, ${"@" + user} has caught a ${data.poke}!`,
        `${"@" + user} has added a new member to their team - a ${data.poke}!`,
        `Another successful catch! ${"@" + user} 've caught a ${data.poke}!`,
        `${"@" + user} can now celebrate - caught a ${data.poke}!`,
      ];
      const randomCatchMessage =
        catchtMessages[Math.floor(Math.random() * catchtMessages.length)];

      this.sendMessage(client, channel, randomCatchMessage);

      // generate new poke
      return this.initialize(channel);
    }
  };
}

export const poke = new Poke();
