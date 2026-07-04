import { Crosshair, Radio, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";

import GuestHeroHomePage from "@/components/GuestHeroHomePage";
import UserHeroHomePage from "@/components/UserHeroHomePage";
import { getPokemonDetail } from "@/features/pokemon/queries";

type Props = {
  user: { id: string; channel: string } | null;
};

export default async function HeroHomePage({ user }: Props) {
  const pikachu = await getPokemonDetail("pikachu");
  const pikachuImage = pikachu?.image ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

  return (
    <section className="relative overflow-hidden py-14 tablet:py-20 laptop:py-24">
      <div className="container grid items-center gap-12 laptop:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col items-start gap-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5">
            <Radio className="size-3.5 text-primary" />
            <span className="game-kicker">Twitch chat game + OBS overlay</span>
          </div>

          <div className="grid gap-5">
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.045em] tablet:text-7xl">
              Let chat catch,
              <span className="block text-primary">battle, gift, and trade.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground tablet:text-lg">
              Run a persistent Pokémon game inside your stream. Your viewers
              fight live encounters, build collections, send gifts, and swap
              trades while the overlay keeps the action visible on screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Crosshair className="size-4 text-primary" /> Live encounters
            </span>
            <span className="inline-flex items-center gap-2">
              <Trophy className="size-4 text-primary" /> Persistent collections
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Gifts and trades
            </span>
          </div>

          <div className="w-full laptop:max-w-xl">
            {user ? <UserHeroHomePage data={user} /> : <GuestHeroHomePage />}
          </div>
        </div>

        <EncounterPreview image={pikachuImage} />
      </div>
    </section>
  );
}

function EncounterPreview({ image }: { image: string }) {
  return (
    <div className="game-panel scanlines pixel-corners relative mx-auto w-full max-w-xl overflow-hidden p-3">
      <div className="relative z-10 flex items-center justify-between border-b-2 border-border bg-background/55 px-4 py-3">
        <div>
          <p className="game-kicker">OBS // Browser source</p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-[330px] content-between overflow-hidden bg-[linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--surface))_100%)] p-5 tablet:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="pixel-shadow min-w-0 flex-1 border-2 border-border bg-background/90 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-black uppercase tracking-wide">
                Pikachu
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-primary">
                HP
              </span>
              <div className="h-3 flex-1 border-2 border-background bg-muted">
                <div className="h-full w-[72%] bg-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto my-6 size-44">
          <div className="absolute inset-3 rotate-45 border-2 border-primary/20" />
          <div className="absolute inset-8 -rotate-12 border-2 border-accent/30" />
          <div className="absolute inset-6 flex items-center justify-center rounded-full">
            <div className="flex size-full items-center justify-center rounded-full">
              <Image
                src={image}
                alt="Pikachu sprite"
                width={130}
                height={130}
                className="max-h-32 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
