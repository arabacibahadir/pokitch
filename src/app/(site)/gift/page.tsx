import { GiftForm } from "@/features/transfers/GiftForm";
import { getTransferContext } from "@/features/transfers/queries";

export const dynamic = "force-dynamic";

export default async function GiftPage() {
  const { owned, collectors } = await getTransferContext();

  return (
    <section className="container grid max-w-5xl gap-7 py-10 tablet:py-14">
      <div>
        <p className="game-kicker">Gift terminal</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight tablet:text-5xl">
          Send a Pokémon to another collector
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Select one Pokémon and a recipient. Transfers are validated and
          completed as a single database operation.
        </p>
      </div>
      <div className="game-panel p-5 tablet:p-7">
        <GiftForm owned={owned} collectors={collectors} />
      </div>
    </section>
  );
}
