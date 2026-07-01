import { Check, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { decideTradeAction } from "@/features/transfers/actions";
import type { TradeRow } from "@/features/transfers/types";

export function TradeList({
  title,
  trades,
  mode,
}: {
  title: string;
  trades: TradeRow[];
  mode: "sent" | "received";
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {trades.length}
        </span>
      </div>
      {!trades.length ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No {mode} offers.
        </div>
      ) : (
        <div className="grid gap-3">
          {trades.map((trade) => (
            <article
              key={trade.id}
              className="grid gap-3 rounded-xl border border-border bg-card p-4 tablet:grid-cols-[1fr_auto] tablet:items-center"
            >
              <div>
                <p className="font-medium">
                  <span className="capitalize">{trade.poke}</span>
                  <span className="mx-2 text-muted-foreground">↔</span>
                  <span className="capitalize">{trade.recipientpoke}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === "sent"
                    ? `Offer sent to ${trade.recipient}`
                    : `Offer from ${trade.user}`}
                </p>
              </div>
              <div className="flex gap-2">
                {mode === "received" ? (
                  <>
                    <DecisionButton
                      tradeId={trade.id}
                      decision="accept"
                      variant="success"
                    >
                      <Check className="size-4" />
                      Accept
                    </DecisionButton>
                    <DecisionButton
                      tradeId={trade.id}
                      decision="deny"
                      variant="destructive"
                    >
                      <X className="size-4" />
                      Deny
                    </DecisionButton>
                  </>
                ) : (
                  <DecisionButton
                    tradeId={trade.id}
                    decision="cancel"
                    variant="destructive"
                  >
                    <Trash2 className="size-4" />
                    Cancel
                  </DecisionButton>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DecisionButton({
  tradeId,
  decision,
  variant,
  children,
}: {
  tradeId: string;
  decision: "accept" | "deny" | "cancel";
  variant: "success" | "destructive";
  children: React.ReactNode;
}) {
  return (
    <form action={decideTradeAction}>
      <input type="hidden" name="tradeId" value={tradeId} />
      <input type="hidden" name="decision" value={decision} />
      <Button type="submit" variant={variant}>
        {children}
      </Button>
    </form>
  );
}
