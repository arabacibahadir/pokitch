import GiftRecipientDropdown from "@/components/GiftRecipientDropdown";
import Layout from "@/components/Layout";
import UserPokemonsDropdown from "@/components/UserPokemonsDropdown";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

type PokemonCollectionItem = {
  id: number;
  poke: string;
};

type OtherUserName = {
  user: string;
};

type GiftPageUser = {
  id: string;
  channel: string;
  pokemonCollection: PokemonCollectionItem[];
  otherUserNames: OtherUserName[];
};

export default function Gift({ user }: { user: GiftPageUser }) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [pokemonID, setPokemonID] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleGift = async () => {
    if (pokemonID === null || !giftRecipient || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: giftedRow, error: addError } = await supabase
        .from("collections")
        .insert([
          {
            poke: selectedPokemon,
            user: giftRecipient,
            channel: user.channel,
          },
        ])
        .select("id")
        .single();

      if (addError || !giftedRow) {
        console.log("add error", addError);
        return;
      }

      const { error: removePokemonError } = await supabase
        .from("collections")
        .delete()
        .match({ id: pokemonID, user: user.channel });

      if (removePokemonError) {
        await supabase.from("collections").delete().match({ id: giftedRow.id });
        console.log("remove error", removePokemonError);
        return;
      }

      const { error: removeTradeError } = await supabase
        .from("trades")
        .delete()
        .match({ poke: selectedPokemon, user: user.channel });

      if (removeTradeError) {
        console.log("remove error", removeTradeError);
      }

      setSelectedPokemon("");
      setGiftRecipient("");
      setPokemonID(null);
      await router.replace(router.asPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <div className="container flex flex-row items-center  justify-center space-x-8">
          <div className="space-y-6">
            <UserPokemonsDropdown
              user={user}
              onChange={(selectedPokemon, pokemonID) => {
                setSelectedPokemon(selectedPokemon);
                setPokemonID(pokemonID);
              }}
            />
          </div>
          <GiftRecipientDropdown
            user={user}
            onChange={(selectedUser: string) => {
              setGiftRecipient(selectedUser);
            }}
          />
          <Button
            className="mt-8"
            disabled={isSubmitting || !pokemonID || !giftRecipient}
            onClick={() => {
              void handleGift();
            }}
          >
            <div className="inline-flex items-center">
              <span>Gift poke</span>
            </div>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { data } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", session.user.id)
    .single();

  if (!data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const userName = session.user.user_metadata.name as string;

  const { data: pokemonData } = await supabase
    .from("collections")
    .select()
    .eq("user", userName);

  const { data: otherUserNames } = await supabase
    .from("collections")
    .select("user")
    .neq("user", userName);

  const user: GiftPageUser = {
    ...data,
    pokemonCollection: pokemonData ?? [],
    otherUserNames: otherUserNames ?? [],
  };

  return {
    props: {
      user: user,
    },
  };
};
