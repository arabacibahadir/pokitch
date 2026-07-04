"use client";

import { useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTradeAction } from "@/features/transfers/actions";
import {
  initialTransferState,
  type CollectionOption,
  type CollectorOption,
} from "@/features/transfers/types";

import { TransferActionMessage } from "./TransferActionMessage";

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
  const [loadError, setLoadError] = useState(false);
  const [state, action, pending] = useActionState(
    createTradeAction,
    initialTransferState,
  );

  async function loadCollector(value: string) {
    setCollector(value);
    setRequested([]);
    setLoadError(false);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/collectors/${encodeURIComponent(value)}/pokemon`,
      );
      if (!response.ok) throw new Error("Collector inventory unavailable");
      setRequested((await response.json()) as CollectionOption[]);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 tablet:grid-cols-3">
        <Field>
          <FieldLabel>You offer</FieldLabel>
          <Select name="offeredCollectionId" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your Pokémon" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {owned.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.poke}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Collector</FieldLabel>
          <Select
            value={collector}
            onValueChange={(value) => void loadCollector(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a collector" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {collectors.map((item) => (
                  <SelectItem key={item.twitchId} value={item.twitchId}>
                    {item.username}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field data-disabled={!collector || loading}>
          <FieldLabel>You request</FieldLabel>
          <Select
            name="requestedCollectionId"
            required
            disabled={!collector || loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={loading ? "Loading…" : "Choose their Pokémon"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {requested.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.poke}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      {loadError ? (
        <Alert variant="warning">
          <AlertDescription>
            This collector&apos;s Pokémon could not be loaded. Choose them again
            or retry in a moment.
          </AlertDescription>
        </Alert>
      ) : null}
      <TransferActionMessage state={state} />
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
