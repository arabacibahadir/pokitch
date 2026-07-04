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
    title: "Streamer setup",
    description:
      "Sign in, copy your browser-source URL, and bring the game into OBS without extra production clutter.",
  },
  {
    icon: MessageSquareText,
    title: "Chat-driven play",
    description:
      "Viewers attack encounters, check status, claim welcome packs, and jump into the game from chat.",
  },
  {
    icon: ShieldCheck,
    title: "Account-linked actions",
    description:
      "Twitch sign-in gates gifting, trading, and setup so collector actions stay tied to the right identity.",
  },
  {
    icon: Archive,
    title: "Collections that stick",
    description:
      "Every catch is saved and searchable by trainer, channel, or Pokémon, turning one stream into a long-running meta game.",
  },
  {
    icon: Repeat2,
    title: "Safe trading",
    description:
      "Collectors can send offers, review incoming trades, and complete exchanges through validated handoffs.",
  },
  {
    icon: Gift,
    title: "Direct gifting",
    description:
      "Send a Pokémon from one collection to another in a single flow when you want rewards, giveaways, or community moments.",
  },
];

export default function FeaturesHomePage() {
  return (
    <section className="border-y-2 border-border bg-background/70 py-16 tablet:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="game-kicker">Core systems</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight tablet:text-5xl">
            Built for the whole stream loop
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chat plays together, the
            overlay stays readable, and progress carries forward after the
            stream ends.
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
