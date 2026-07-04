import Image from "next/image";

import { getPokemonSpriteUrl } from "@/features/pokemon/presentation";

import {
  getHealthPercent,
  getHealthTone,
  type ActivePoke,
  type OverlayCatch,
  type OverlayEvent,
  type OverlaySize,
} from "./model";

export function OverlayView({
  poke,
  size,
  event,
  catch: lastCatch,
}: {
  poke: ActivePoke;
  size: OverlaySize;
  event: OverlayEvent;
  catch: OverlayCatch;
}) {
  const health = Math.max(0, Math.min(50, poke.health));
  const tone = getHealthTone(health);

  return (
    <article
      key={`${poke.poke}-${health}`}
      data-testid="overlay-card"
      data-size={size}
      data-health={tone}
      className="overlay-card"
    >
      <figure className="overlay-sprite-frame">
        <Image
          unoptimized
          src={getPokemonSpriteUrl(poke.poke)}
          alt=""
          width={128}
          height={128}
          loading="eager"
          className="overlay-sprite"
          onError={(event) => {
            event.currentTarget.src = "/pokeball.svg";
          }}
        />
        {event.kind && event.at ? (
          <span
            key={event.at}
            className="overlay-event"
            data-kind={event.kind}
            role="status"
          >
            {event.kind === "caught"
              ? `CAUGHT @${event.player}`
              : `-${event.damage ?? 0} @${event.player}`}
          </span>
        ) : null}
      </figure>
      <div className="overlay-details">
        <div className="overlay-heading">
          <h1>{poke.poke}</h1>
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
        {lastCatch.poke && lastCatch.player ? (
          <p className="overlay-last-catch">
            Last: @<span>{lastCatch.player}</span> caught {lastCatch.poke}
          </p>
        ) : null}
      </div>
    </article>
  );
}
