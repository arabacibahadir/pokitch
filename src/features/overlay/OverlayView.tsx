"use client";

import { useEffect, useState } from "react";
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
  hideCatch = false,
  hideAttack = false,
  primaryColor,
  cardColor,
  textColor,
  theme = "default",
  hideTicker = false,
}: {
  poke: ActivePoke;
  size: OverlaySize;
  event: OverlayEvent;
  catch: OverlayCatch;
  hideCatch?: boolean;
  hideAttack?: boolean;
  primaryColor?: string;
  cardColor?: string;
  textColor?: string;
  theme?: string;
  hideTicker?: boolean;
}) {
  const [catchingState, setCatchingState] = useState<{
    isCatching: boolean;
    caughtPoke: string;
    phase: "suck" | "wiggle" | "success" | "reveal";
  } | null>(null);

  const [isDamaged, setIsDamaged] = useState(false);

  useEffect(() => {
    if (event.kind === "caught" && event.at && lastCatch.poke) {
      // Start the catching sequence
      setCatchingState({
        isCatching: true,
        caughtPoke: lastCatch.poke,
        phase: "suck",
      });

      // 1. After 800ms of suck-in, wiggle the Pokeball
      const wiggleTimer = setTimeout(() => {
        setCatchingState((prev) =>
          prev ? { ...prev, phase: "wiggle" } : null
        );
      }, 800);

      // 2. After 2300ms (3 wiggles of ~500ms), show success flash/sparks
      const successTimer = setTimeout(() => {
        setCatchingState((prev) =>
          prev ? { ...prev, phase: "success" } : null
        );
      }, 2300);

      // 3. After 3000ms, start revealing the new pokemon
      const revealTimer = setTimeout(() => {
        setCatchingState((prev) =>
          prev ? { ...prev, phase: "reveal" } : null
        );
      }, 3000);

      // 4. After 3400ms, complete the animation and show the new pokemon fully
      const doneTimer = setTimeout(() => {
        setCatchingState(null);
      }, 3400);

      return () => {
        clearTimeout(wiggleTimer);
        clearTimeout(successTimer);
        clearTimeout(revealTimer);
        clearTimeout(doneTimer);
      };
    } else if (event.kind === "hit" && event.at) {
      // Trigger damage animation
      setIsDamaged(true);
      const timer = setTimeout(() => setIsDamaged(false), 500);
      return () => clearTimeout(timer);
    }
  }, [event.at, event.kind, lastCatch.poke]);

  // Determine what to display based on the animation state
  const isCatching = catchingState?.isCatching && catchingState.phase !== "reveal";
  const displayPoke = isCatching ? catchingState.caughtPoke : poke.poke;
  const displayHealth = isCatching ? 0 : Math.max(0, Math.min(50, poke.health));
  const tone = getHealthTone(displayHealth);

  const renderSparkles = () => {
    if (catchingState?.phase !== "success") return null;
    return (
      <div className="overlay-sparkles">
        {[...Array(6)].map((_, i) => (
          <span key={i} className={`sparkle sparkle-${i}`} />
        ))}
      </div>
    );
  };

  const customStyles: React.CSSProperties = {};
  if (primaryColor) {
    const formattedPrimary = primaryColor.startsWith("#") ? primaryColor : `#${primaryColor}`;
    customStyles["--overlay-primary" as any] = formattedPrimary;
    customStyles["--overlay-primary-border" as any] = `${formattedPrimary}66`;
  }
  if (cardColor) {
    customStyles["--overlay-card" as any] = cardColor.startsWith("#") ? cardColor : `#${cardColor}`;
  }
  if (textColor) {
    const formattedText = textColor.startsWith("#") ? textColor : `#${textColor}`;
    customStyles["--overlay-text" as any] = formattedText;
    customStyles["--overlay-muted-text" as any] = `${formattedText}bf`;
  }

  return (
    <article
      data-testid="overlay-card"
      data-size={size}
      data-health={tone}
      data-theme={theme}
      className="overlay-card"
      style={customStyles}
    >
      <figure
        className={`overlay-sprite-frame ${isDamaged ? "is-damaged" : ""} ${
          catchingState ? `is-catching phase-${catchingState.phase}` : ""
        }`}
      >
        <Image
          key={displayPoke}
          unoptimized
          src={getPokemonSpriteUrl(displayPoke)}
          alt=""
          width={128}
          height={128}
          loading="eager"
          className="overlay-sprite"
          onError={(event) => {
            event.currentTarget.src = "/pokeball.svg";
          }}
        />

        {catchingState ? (
          <div className="overlay-pokeball-container">
            <Image
              src="/pokeball.svg"
              alt="Pokeball"
              width={48}
              height={48}
              className="overlay-pokeball"
            />
            {renderSparkles()}
          </div>
        ) : null}

      </figure>
      <div className="overlay-details">
        <div className="overlay-heading">
          <h1>{displayPoke}</h1>
          <span>{displayHealth}/50</span>
        </div>
        <div
          className="overlay-health-track"
          aria-label={`${displayHealth} of 50 health`}
        >
          <div
            className="overlay-health-fill"
            style={{ width: `${getHealthPercent(displayHealth)}%` }}
          />
        </div>
        {!hideCatch && lastCatch.poke && lastCatch.player ? (
          <p className="overlay-last-catch">
            Last: @<span>{lastCatch.player}</span> caught {lastCatch.poke}
          </p>
        ) : null}
        {!hideAttack && event.player && event.kind === "hit" ? (
          <p className="overlay-last-attack">
            Hit: @<span>{event.player}</span> (-{event.damage ?? 0} HP)
          </p>
        ) : null}
        {!hideTicker && (
          <div className="overlay-ticker" role="marquee">
            <span className="overlay-ticker-text">
              Visit pokitch.app for more info • Type !poke attack to battle & catch! •
            </span>
          </div>
        )}
      </div>
      {event.kind && event.at ? (
        <span
          key={event.at}
          className="overlay-event"
          data-kind={event.kind}
          role="status"
        >
          {event.kind === "caught"
            ? `🎉 CAUGHT @${event.player}`
            : `💥 -${event.damage ?? 0} @${event.player}`}
        </span>
      ) : null}
    </article>
  );
}
