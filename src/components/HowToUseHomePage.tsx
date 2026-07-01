const steps = [
  [
    "Copy the overlay URL",
    "Sign in and copy your unique OBS browser-source URL.",
  ],
  [
    "Add a browser source",
    "Paste the URL into OBS Studio or your preferred streaming software.",
  ],
  ["Set the dimensions", "Use a width of 256 and a height of 76 pixels."],
  [
    "Moderate the bot",
    "Run /mod pokitch_bot in Twitch chat so commands work reliably.",
  ],
  ["Go live", "The overlay updates automatically as viewers play."],
];

export default function HowToUseHomePage() {
  return (
    <section id="how-to-use" className="py-16 tablet:py-24">
      <div className="container max-w-4xl">
        <div className="text-center">
          <p className="game-kicker">Quick start quest</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight tablet:text-5xl">
            Go live in five moves
          </h2>
          <p className="mt-3 text-muted-foreground">
            The public overlay URL remains stable after this upgrade.
          </p>
        </div>
        <ol className="game-panel mt-10 divide-y-2 divide-border overflow-hidden">
          {steps.map(([title, description], index) => (
            <li
              key={title}
              className="grid gap-3 bg-card p-5 transition hover:bg-muted/60 tablet:grid-cols-[56px_180px_1fr] tablet:items-center"
            >
              <span className="font-mono text-lg font-black text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
