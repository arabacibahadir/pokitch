import GiftRecipientDropdown from "@/components/GiftRecipientDropdown";
import Layout from "@/components/Layout";
import UserPokemonsDropdown from "@/components/UserPokemonsDropdown";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";

export default function Gift({ user }: { user: any }) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [pokemonID, setPokemonID] = useState("");
  const router = useRouter();

  if (!user) {
    router.push("/");
    return null;
  }
  function handleGift() {
    if (!pokemonID || !giftRecipient) {
      return null;
    }
    const removePokemon = async () => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .match({ id: pokemonID, user: user.channel });

      if (error) {
        console.log("remove error", error);
      }
    };
    const addPokemon = async () => {
      const { error } = await supabase.from("collections").insert([
        {
          poke: selectedPokemon,
          user: giftRecipient,
          channel: user.channel,
        },
      ]);
      if (error) {
        console.log("add error", error);
      }
    };
    removePokemon();
    addPokemon();
    setSelectedPokemon("");
    setGiftRecipient("");
    router.replace(router.asPath);
  }

  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <h1>Gift</h1>
        <div className="container container flex flex-row space-x-8">
          <div className="space-y-6">
            <UserPokemonsDropdown
              key={user.pokemonCollection}
              user={user}
              onChange={(selectedPokemon, pokemonID) => {
                setSelectedPokemon(selectedPokemon);
                setPokemonID(pokemonID);
              }}
            />
          </div>
          <GiftRecipientDropdown
            key={user.otherUserNames}
            user={user}
            onChange={(selectedUser: SetStateAction<string>) => {
              setGiftRecipient(selectedUser);
            }}
          />
          <Button
            className="mt-5"
            onClick={() => {
              handleGift();
            }}
          >
            <div className="inline-flex items-center space-x-2">
              <span>Gift pokemon</span>
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
  const { data } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", session?.user?.id)
    .single();

  const { data: pokemonData } = await supabase
    .from("collections")
    .select()
    .eq("user", session?.user.user_metadata.name);

  const { data: otherUserNames } = await supabase
    .from("collections")
    .select("user")
    .neq("user", session?.user.user_metadata.name);

  const user = data
    ? {
        ...data,
        pokemonCollection: pokemonData,
        otherUserNames: otherUserNames,
      }
    : null;

  return {
    props: {
      user: user,
    },
  };
};
