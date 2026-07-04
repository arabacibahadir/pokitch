"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { TransferActionState } from "./types";
import { getPublicTransferError } from "./errors";
import {
  parseGiftInput,
  parseTradeDecisionInput,
  parseTradeOfferInput,
} from "./validation";

function errorState(message: string): TransferActionState {
  return { status: "error", message };
}

function successState(message: string): TransferActionState {
  return { status: "success", message };
}

export async function giftPokemonAction(
  _state: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  try {
    const input = parseGiftInput({
      collectionId: formData.get("collectionId"),
      recipientTwitchId: formData.get("recipientTwitchId"),
    });
    const supabase = await createClient();
    const { error } = await supabase.rpc("gift_pokemon", {
      p_collection_id: input.collectionId,
      p_recipient_twitch_id: input.recipientTwitchId,
    });

    if (error) {
      console.error("gift_pokemon RPC failed", error);
      return errorState(getPublicTransferError(error.message));
    }

    revalidatePath("/gift");
    revalidatePath("/collections");
    return successState("Pokémon sent successfully.");
  } catch {
    return errorState("Choose a Pokémon and recipient.");
  }
}

export async function createTradeAction(
  _state: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  try {
    const input = parseTradeOfferInput({
      offeredCollectionId: formData.get("offeredCollectionId"),
      requestedCollectionId: formData.get("requestedCollectionId"),
    });
    const supabase = await createClient();
    const { error } = await supabase.rpc("create_trade_offer", {
      p_offered_collection_id: input.offeredCollectionId,
      p_requested_collection_id: input.requestedCollectionId,
    });

    if (error) {
      console.error("create_trade_offer RPC failed", error);
      return errorState(getPublicTransferError(error.message));
    }

    revalidatePath("/trade");
    return successState("Trade offer created.");
  } catch {
    return errorState("Choose both Pokémon before creating the offer.");
  }
}

export async function decideTradeAction(formData: FormData) {
  const input = parseTradeDecisionInput({
    tradeId: formData.get("tradeId"),
    decision: formData.get("decision"),
  });
  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_trade_offer", {
    p_trade_id: input.tradeId,
    p_decision: input.decision,
  });

  if (error) {
    console.error("resolve_trade_offer RPC failed", error);
    throw new Error(getPublicTransferError(error.message));
  }

  revalidatePath("/trade");
  revalidatePath("/collections");
}
