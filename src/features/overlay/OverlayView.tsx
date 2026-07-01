import Image from "next/image";

import {
  getHealthPercent,
  getHealthTone,
  type ActivePoke,
  type EncounterEvent,
  type OverlaySize,
} from "./model";

export function OverlayView({
  event,
  poke,
  size,
}: {
  event: EncounterEvent | null;
  poke: ActivePoke;
  size: OverlaySize;
}) {
  const displayPoke = event?.eventType === "caught" ? event.poke : poke.poke;
  const health = Math.max(0, Math.min(50, event?.health ?? poke.health));
  const tone = getHealthTone(health);

  return (
    <article
      key={`${displayPoke}-${health}-${event?.id ?? "idle"}`}
      data-testid="overlay-card"
      data-size={size}
      data-health={tone}
      data-event={event?.eventType ?? "idle"}
      data-critical={event?.critical ? "true" : "false"}
      className="overlay-card"
    >
      <figure className="overlay-sprite-frame">
        <Image
          unoptimized
          src={`https://projectpokemon.org/images/normal-sprite/${displayPoke}.gif`}
          alt=""
          width={128}
          height={128}
          loading="eager"
          className="overlay-sprite"
          onError={(event) => {
            event.currentTarget.src = "/pokeball.svg";
          }}
        />
      </figure>
      <div className="overlay-details">
        <div className="overlay-heading">
          <h1>{displayPoke}</h1>
          <span>{health}/50</span>
        </div>
        <div
          className="overlay-health-track"
          aria-label={`${health} of 50 health`}
        >
          <div
            className="overlay-health-fill"
            style={{ width: `${getHealthPercent(health)}%` }}
          />
        </div>
      </div>
      {event ? <EncounterFeedback event={event} /> : null}
    </article>
  );
}

function EncounterFeedback({ event }: { event: EncounterEvent }) {
  if (event.eventType === "caught") {
    return (
      <output className="overlay-event overlay-catch" aria-live="polite">
        <strong>@{event.username} caught it!</strong>
        <span>
          {event.participants} trainers · max x{event.maxCombo}
        </span>
      </output>
    );
  }

  return (
    <output className="overlay-event" aria-live="polite">
      <strong>@{event.username}</strong>
      <span>
        −{event.damage} HP
        {event.critical ? " · CRITICAL" : ` · x${event.combo} combo`}
      </span>
    </output>
  );
}
