export function OverlayNotFound() {
  return (
    <main className="overlay-viewport place-items-center bg-background/95 p-4 text-center">
      <section className="game-panel max-w-md space-y-3 p-6" role="alert">
        <p className="game-kicker">OBS overlay unavailable</p>
        <h1 className="text-2xl font-black">Overlay not found</h1>
        <p className="text-sm text-muted-foreground">
          Check that the Browser Source URL was copied from your Pokitch setup
          screen and that the signed-in Twitch account is still connected.
        </p>
      </section>
    </main>
  );
}
