import { SignInPrompt } from "@/components/SignInPrompt";
import { StreamerSetup } from "@/components/StreamerSetup";
import { getAppOrigin } from "@/features/auth/origin";
import { getCurrentAccount } from "@/features/auth/queries";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <section className="container flex justify-center py-10 tablet:py-14">
        <SignInPrompt
          destination="/setup"
          title="Unlock streamer setup"
          description="Sign in with Twitch to copy your overlay URL and finish the setup checklist before going live."
        />
      </section>
    );
  }

  const url = `${getAppOrigin()}/overlays/${account.id}`;

  return (
    <section className="container grid max-w-5xl gap-7 py-10 tablet:py-14">
      <div>
        <p className="game-kicker">Streamer setup</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight tablet:text-5xl">
          Prepare your overlay for stream
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Copy your browser-source URL, add it to OBS, and work through the
          checklist once. Your viewers can keep playing against the same public
          overlay after setup is done.
        </p>
      </div>
      <div className="game-panel p-5 tablet:p-7">
        <StreamerSetup accountId={account.id} url={url} />
      </div>
    </section>
  );
}
