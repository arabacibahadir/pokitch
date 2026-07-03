"use client";

import { useActionState } from "react";

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
import { giftPokemonAction } from "@/features/transfers/actions";
import {
  initialTransferState,
  type CollectionOption,
  type CollectorOption,
} from "@/features/transfers/types";

import { TransferActionMessage } from "./TransferActionMessage";

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
    <form action={action} className="flex flex-col gap-5">
      <FieldGroup className="grid gap-4 tablet:grid-cols-2">
        <Field>
          <FieldLabel>Your Pokémon</FieldLabel>
          <Select name="collectionId" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a Pokémon" />
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
          <FieldLabel>Recipient</FieldLabel>
          <Select name="recipientTwitchId" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a collector" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {collectors.map((collector) => (
                  <SelectItem
                    key={collector.twitchId}
                    value={collector.twitchId}
                  >
                    {collector.username}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <TransferActionMessage state={state} />
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
