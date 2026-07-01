"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { giftPokemonAction } from "@/features/transfers/actions";
import {
  initialTransferState,
  type CollectionOption,
  type CollectorOption,
} from "@/features/transfers/types";
import { cn } from "@/lib/utils";

export function GiftForm({
  owned,
  collectors,
}: {
  owned: CollectionOption[];
  collectors: CollectorOption[];
}) {
  const [state, action, pending] = useActionState(
    giftPokemonAction,
    initialTransferState,
  );

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 tablet:grid-cols-2">
        <Field label="Your Pokémon">
          <select name="collectionId" required className={selectClassName}>
            <option value="">Choose a Pokémon</option>
            {owned.map((item) => (
              <option key={item.id} value={item.id}>
                {item.poke}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Recipient">
          <select name="recipientTwitchId" required className={selectClassName}>
            <option value="">Choose a collector</option>
            {collectors.map((collector) => (
              <option key={collector.twitchId} value={collector.twitchId}>
                {collector.username}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ActionMessage state={state} />
      <Button
        className="w-full tablet:w-fit"
        size="lg"
        disabled={pending || !owned.length || !collectors.length}
      >
        {pending ? "Sending…" : "Send Pokémon"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function ActionMessage({
  state,
}: {
  state: typeof initialTransferState;
}) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      )}
    >
      {state.message}
    </p>
  );
}

export const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";
