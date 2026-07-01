"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { createTradeAction } from "@/features/transfers/actions";
import {
  initialTransferState,
  type CollectionOption,
  type CollectorOption,
} from "@/features/transfers/types";

import { ActionMessage, selectClassName } from "./GiftForm";

export function TradeForm({
  owned,
  collectors,
}: {
  owned: CollectionOption[];
  collectors: CollectorOption[];
}) {
  const [collector, setCollector] = useState("");
  const [requested, setRequested] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, action, pending] = useActionState(
    createTradeAction,
    initialTransferState,
  );

  async function loadCollector(value: string) {
    setCollector(value);
    setRequested([]);
    if (!value) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/collectors/${encodeURIComponent(value)}/pokemon`,
      );
      if (response.ok) {
        setRequested((await response.json()) as CollectionOption[]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 tablet:grid-cols-3">
        <Field label="You offer">
          <select
            name="offeredCollectionId"
            required
            className={selectClassName}
          >
            <option value="">Choose your Pokémon</option>
            {owned.map((item) => (
              <option key={item.id} value={item.id}>
                {item.poke}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Collector">
          <select
            value={collector}
            required
            className={selectClassName}
            onChange={(event) => void loadCollector(event.target.value)}
          >
            <option value="">Choose a collector</option>
            {collectors.map((item) => (
              <option key={item.twitchId} value={item.twitchId}>
                {item.username}
              </option>
            ))}
          </select>
        </Field>
        <Field label="You request">
          <select
            name="requestedCollectionId"
            required
            disabled={!collector || loading}
            className={selectClassName}
          >
            <option value="">
              {loading ? "Loading…" : "Choose their Pokémon"}
            </option>
            {requested.map((item) => (
              <option key={item.id} value={item.id}>
                {item.poke}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ActionMessage state={state} />
      <Button
        className="w-full tablet:w-fit"
        size="lg"
        disabled={pending || !owned.length}
      >
        {pending ? "Creating…" : "Create trade offer"}
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
