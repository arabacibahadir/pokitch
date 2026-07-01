import { Crosshair, Radio, Sparkles, Trophy } from "lucide-react";

import GuestHeroHomePage from "@/components/GuestHeroHomePage";
import UserHeroHomePage from "@/components/UserHeroHomePage";

type Props = {
  user: { id: string; channel: string } | null;
};

export default function HeroHomePage({ user }: Props) {
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
              Your chat.
              <span className="block text-primary">Their adventure.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground tablet:text-lg">
              Turn every stream into a shared catching game. Viewers battle,
              collect, gift, and trade Pokémon while your overlay reacts live.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Crosshair className="size-4 text-primary" /> Chat battles
            </span>
            <span className="inline-flex items-center gap-2">
              <Trophy className="size-4 text-primary" /> Persistent catches
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Live reactions
            </span>
          </div>

          <div className="w-full laptop:max-w-xl">
            {user ? <UserHeroHomePage data={user} /> : <GuestHeroHomePage />}
          </div>
        </div>

        <EncounterPreview />
      </div>
    </section>
  );
}

function EncounterPreview() {
  return (
    <div className="game-panel scanlines pixel-corners relative mx-auto w-full max-w-xl overflow-hidden p-3">
      <div className="relative z-10 flex items-center justify-between border-b-2 border-border bg-background/55 px-4 py-3">
        <div>
          <p className="game-kicker">OBS // Browser source</p>
          <p className="mt-1 text-sm font-black">LIVE ENCOUNTER</p>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] font-bold text-emerald-300">
          <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
          SYNCED
        </span>
      </div>

      <div className="relative z-10 grid min-h-[390px] content-between overflow-hidden bg-[radial-gradient(circle_at_50%_44%,oklch(var(--secondary)),transparent_26%),linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--surface))_100%)] p-5 tablet:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 border-2 border-border bg-background/90 p-3 shadow-[4px_4px_0_oklch(0.1_0.02_274)]">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-black uppercase tracking-wide">
                Wild Pikachu
              </p>
              <span className="font-mono text-xs text-primary">LV. 50</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-primary">
                HP
              </span>
              <div className="h-3 flex-1 border-2 border-background bg-muted">
                <div className="h-full w-[72%] bg-emerald-400" />
              </div>
            </div>
          </div>
          <span className="rounded bg-primary px-2 py-1 font-mono text-[10px] font-black text-primary-foreground">
            36 / 50
          </span>
        </div>

        <div className="relative mx-auto my-6 size-44">
          <div className="absolute inset-3 rotate-45 border-2 border-primary/20" />
          <div className="absolute inset-8 -rotate-12 border-2 border-accent/30" />
          <div className="absolute inset-12 flex items-center justify-center rounded-full border-[12px] border-primary bg-card shadow-[0_0_60px_oklch(var(--primary)/.25)]">
            <div className="flex size-full items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-black text-primary-foreground">
              P
            </div>
          </div>
        </div>

        <div className="border-2 border-border bg-background/90 p-4 shadow-[4px_4px_0_oklch(0.1_0.02_274)]">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-accent">viewer_07</span> used
            <span className="font-bold text-foreground"> !poke</span>
          </p>
          <p className="mt-2 font-mono text-sm font-bold">
            A critical hit! <span className="text-primary">-14 HP</span>
            <span className="ml-1 inline-block animate-pulse">▮</span>
          </p>
        </div>
      </div>
    </div>
  );
}
