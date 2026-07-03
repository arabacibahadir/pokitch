import { Zap } from "lucide-react";

const commands = [
  {
    cmd: "!poke attack",
    alias: "!poke a",
    note: "Deal damage to the wild Pokémon on the overlay.",
  },
  {
    cmd: "!poke status",
    alias: "!poke s",
    note: "See remaining health of the current encounter.",
  },
  {
    cmd: "!poke last",
    alias: "!poke l",
    note: "Check who made the latest catch in this channel.",
  },
  {
    cmd: "!poke inventory",
    alias: "!poke i",
    note: "Open your collection page in the browser.",
  },
  {
    cmd: "!poke welcomepack",
    alias: "!poke wp",
    note: "Claim your first Pokémon (one per channel).",
  },
  {
    cmd: "!poke help",
    alias: "!poke h",
    note: "Print this command list in chat.",
  },
];

export default function ChatCommandsHomePage() {
  return (
    <section className="py-16 tablet:py-24">
      <div className="container max-w-3xl">
        <div className="text-center">
          <p className="game-kicker">Viewer commands</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight tablet:text-5xl">
            !poke into the chat
          </h2>
          <p className="mt-3 text-muted-foreground">
            Combat outcomes appear on the overlay, not in chat.
          </p>
        </div>
        <ol className="game-panel mt-10 divide-y-2 divide-border overflow-hidden">
          {commands.map(({ cmd, alias, note }) => (
            <li
              key={cmd}
              className="flex flex-col gap-1 bg-card p-4 transition hover:bg-muted/60 tablet:flex-row tablet:items-center tablet:gap-4"
            >
              <span className="shrink-0 font-mono text-sm font-bold text-primary">
                {cmd}
                <span className="ml-2 text-muted-foreground">({alias})</span>
              </span>
              <span className="text-sm text-muted-foreground">{note}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center gap-2 justify-center text-xs text-muted-foreground">
          <Zap className="size-3" />
          Attacks have a short cooldown to keep things fair.
        </p>
      </div>
    </section>
  );
}
