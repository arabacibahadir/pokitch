import {
  Archive,
  Gift,
  MessageSquareText,
  Repeat2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast setup",
    description: "Add one browser source to OBS and start playing.",
  },
  {
    icon: MessageSquareText,
    title: "Chat commands",
    description: "Viewers attack, claim welcome packs, and open collections.",
  },
  {
    icon: ShieldCheck,
    title: "Minimal permissions",
    description: "Authentication is handled through Twitch and Supabase.",
  },
  {
    icon: Archive,
    title: "Collections",
    description: "Every catch is searchable by trainer, channel, or Pokémon.",
  },
  {
    icon: Repeat2,
    title: "Trading",
    description: "Exchange Pokémon through validated, atomic offers.",
  },
  {
    icon: Gift,
    title: "Gifting",
    description: "Transfer a Pokémon to another collector in one step.",
  },
];

export default function FeaturesHomePage() {
  return (
    <section className="border-y-2 border-border bg-background/70 py-16 tablet:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="game-kicker">Core systems</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight tablet:text-5xl">
            One stream. A whole world.
          </h2>
          <p className="mt-3 text-muted-foreground">
            A focused set of tools for running an interactive collection game
            without adding another dashboard to your stream workflow.
          </p>
        </div>
        <div className="mt-10 grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="game-panel flex min-h-36 gap-4 p-5 transition-transform hover:-translate-y-1"
            >
              <span className="pixel-corners flex size-11 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-black">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
