import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentAccount } from "@/features/auth/queries";
import { TradeForm } from "@/features/transfers/TradeForm";
import { TradeList } from "@/features/transfers/TradeList";
import { getTradeContext } from "@/features/transfers/queries";

export const dynamic = "force-dynamic";

export default async function TradePage() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <section className="container py-10 tablet:py-14">
        <SignInPrompt
          destination="/trade"
          title="Sign in to trade Pokémon"
          description="Sign in with Twitch to create offers and review trades sent by other collectors."
        />
      </section>
    );
  }

  const { owned, collectors, sent, received } = await getTradeContext(account);

  return (
    <section className="container grid max-w-6xl gap-8 py-10 tablet:py-14">
      <div>
        <p className="game-kicker">Trade terminal</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight tablet:text-5xl">
          Exchange Pokémon safely
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Offers stay pending until the receiving collector accepts or denies
          them.
        </p>
      </div>
      <div className="game-panel p-5 tablet:p-7">
        <TradeForm owned={owned} collectors={collectors} />
      </div>
      <div className="grid gap-8 laptop:grid-cols-2">
        <TradeList title="Sent offers" trades={sent} mode="sent" />
        <TradeList title="Received offers" trades={received} mode="received" />
      </div>
    </section>
  );
}
