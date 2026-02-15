import GiftRecipientDropdown from "@/components/GiftRecipientDropdown";
import Layout from "@/components/Layout";
import PokemonCard from "@/components/PokeCard";
import UserPokemonsDropdown from "@/components/UserPokemonsDropdown";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";

type PokemonCollectionItem = {
  id: number;
  poke: string;
  user: string;
  channel: string;
};

type OtherUserName = {
  user: string;
};

interface Trade {
  id: number;
  user: string;
  poke: string;
  pokeid: number;
  recipient: string;
  recipientpoke: string;
  recipientpokeid: number;
}

type TradePageUser = {
  id: string;
  channel: string;
  pokemonCollection: PokemonCollectionItem[];
  otherUserNames: OtherUserName[];
};

export default function TradePage({
  user,
  sentTrades,
  receivedTrades,
}: {
  user: TradePageUser;
  sentTrades: Trade[];
  receivedTrades: Trade[];
}) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [pokemonID, setPokemonID] = useState<number | null>(null);
  const [pokemonTradeID, setPokemonTradeID] = useState<number | null>(null);
  const [recipientPokemons, setRecipientPokemons] = useState<
    PokemonCollectionItem[]
  >([]);
  const [pokemonTradeName, setPokemonTradeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [showSentOffers, setShowSentOffers] = useState(true);
  const [isRotated, setIsRotated] = useState(false);
  const [hoveredPokemon, setHoveredPokemon] = useState<string | null>(null);

  const handleCancel = async (tradeID: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("trades").delete().match({ id: tradeID });
      if (error) {
        console.log("remove error", error);
        return;
      }

      await router.replace(router.asPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async (trade: Trade) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: myNewPokemon, error: addMyPokemonError } = await supabase
        .from("collections")
        .insert([
          {
            poke: trade.poke,
            user: user.channel,
            channel: trade.user,
          },
        ])
        .select("id")
        .single();
      if (addMyPokemonError || !myNewPokemon) {
        console.log("add error", addMyPokemonError);
        return;
      }

      const { data: offererNewPokemon, error: addOffererPokemonError } =
        await supabase
          .from("collections")
          .insert([
            {
              poke: trade.recipientpoke,
              user: trade.user,
              channel: user.channel,
            },
          ])
          .select("id")
          .single();
      if (addOffererPokemonError || !offererNewPokemon) {
        await supabase.from("collections").delete().match({ id: myNewPokemon.id });
        console.log("add error", addOffererPokemonError);
        return;
      }

      const { error: removeMyPokemonError } = await supabase
        .from("collections")
        .delete()
        .match({ id: trade.recipientpokeid });
      if (removeMyPokemonError) {
        console.log("remove error", removeMyPokemonError);
        return;
      }

      const { error: removeOffererPokemonError } = await supabase
        .from("collections")
        .delete()
        .match({ id: trade.pokeid });
      if (removeOffererPokemonError) {
        console.log("remove error", removeOffererPokemonError);
        return;
      }

      const { error: acceptTradeError } = await supabase
        .from("trades")
        .delete()
        .match({ id: trade.id });
      if (acceptTradeError) {
        console.log("remove error", acceptTradeError);
      }

      await router.replace(router.asPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async (tradeId: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("trades").delete().match({ id: tradeId });
      if (error) {
        console.log("remove error", error);
        return;
      }

      await router.replace(router.asPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrade = async () => {
    if (
      !pokemonID ||
      !giftRecipient ||
      !pokemonTradeID ||
      !pokemonTradeName ||
      isSubmitting
    ) {
      console.log("missing data");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existingTrade, error: existingTradeError } = await supabase
        .from("trades")
        .select("id")
        .eq("pokeid", pokemonID)
        .eq("user", user.channel)
        .maybeSingle();

      if (existingTradeError) {
        console.log("trade check error", existingTradeError);
        return;
      }
      if (existingTrade) {
        console.log("You have already requested a trade for this Pokemon.");
        return;
      }

      const { error } = await supabase.from("trades").insert([
        {
          user: user.channel,
          poke: selectedPokemon,
          pokeid: pokemonID,
          recipient: giftRecipient,
          recipientpoke: pokemonTradeName,
          recipientpokeid: pokemonTradeID,
        },
      ]);
      if (error) {
        console.log("add error", error);
        return;
      }

      setSelectedPokemon("");
      setGiftRecipient("");
      setPokemonID(null);
      setPokemonTradeID(null);
      setPokemonTradeName("");
      await router.replace(router.asPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        {hoveredPokemon && (
          <div className="fixed left-20 z-10 -translate-x-1/2 translate-y-1/3 transform shadow-2xl">
            <PokemonCard poke={hoveredPokemon} />
          </div>
        )}
        <div className="container flex flex-row justify-center space-x-8">
          <div className="space-y-6">
            <UserPokemonsDropdown
              user={user}
              onChange={(selectedPokemon, pokemonID) => {
                setSelectedPokemon(selectedPokemon);
                setPokemonID(Number(pokemonID));
              }}
            />
          </div>
          <GiftRecipientDropdown
            user={user}
            onChange={async (selectedUser: string) => {
              setGiftRecipient(selectedUser);

              const { data: recipientPokemonsData } = await supabase
                .from("collections")
                .select()
                .eq("user", selectedUser);

              setRecipientPokemons(recipientPokemonsData ?? []);
            }}
          />
          <UserPokemonsDropdown
            user={{ pokemonCollection: recipientPokemons }}
            onChange={(selectedPokemon, pokemonTradeID) => {
              setPokemonTradeID(Number(pokemonTradeID));
              setPokemonTradeName(selectedPokemon);
            }}
          />
          <Button
            className="mt-5 "
            disabled={isSubmitting}
            onClick={() => {
              void handleTrade();
            }}>
            <div className="inline-flex items-center space-x-2">
              <span>Trade request</span>
            </div>
          </Button>
        </div>
        <div className="container flex flex-col items-center justify-center">
          <Button
            variant="transparent"
            className="mt-5"
            onClick={() => {
              setShowSentOffers(!showSentOffers);
              setIsRotated(!isRotated);
            }}>
            <span
              className={
                showSentOffers
                  ? "font-bold underline decoration-amber-400"
                  : "opacity-50"
              }>
              Sent Offers {sentTrades.length ? ` (${sentTrades.length})` : ""}
            </span>
            <FiRefreshCcw
              className={`mx-2 transform ${
                isRotated ? "rotate-180" : ""
              } transition-transform duration-300 ease-in-out`}
            />{" "}
            <span
              className={
                showSentOffers
                  ? "opacity-50"
                  : "font-bold underline decoration-amber-200"
              }>
              Received Offers{" "}
              {receivedTrades.length ? ` (${receivedTrades.length})` : ""}
            </span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center">
          {showSentOffers ? (
            <div>
              <table className="w-full text-center">
                <thead className="underline decoration-amber-300">
                  <tr>
                    <th className="py-3 px-10 text-xl">My Poke</th>
                    <th className="py-3 px-10 text-xl">Trade with</th>
                    <th className="py-3 px-10 text-xl">Requested Poke</th>
                  </tr>
                </thead>
                <tbody>
                  {sentTrades.map((trade: Trade) => (
                    <tr key={trade.id}>
                      <td className="px-8">
                        <Image
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                          alt={trade.poke}
                          width={48}
                          height={48}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}
                        />
                        {trade.poke}
                      </td>
                      <td className="px-10">{trade.recipient}</td>
                      <td className="px-10">
                        <Image
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                          alt={trade.recipientpoke}
                          width={48}
                          height={48}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}
                        />
                        {trade.recipientpoke}
                      </td>
                      <td className="px-10">
                        <Button
                          variant="danger"
                          disabled={isSubmitting}
                          onClick={() => {
                            void handleCancel(trade.id);
                          }}>
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <table className="w-full text-center">
                <thead className="underline decoration-amber-300">
                  <tr>
                    <th className="py-3 px-10 text-xl">Offerer</th>
                    <th className="py-3 px-10 text-xl">Offered Poke</th>
                    <th className="py-3 px-10 text-xl">My Poke</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedTrades.map((trade: Trade) => (
                    <tr key={trade.id}>
                      <td className="px-10">{trade.user}</td>
                      <td className="px-10">
                        <Image
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                          alt={trade.poke}
                          width={48}
                          height={48}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}
                        />
                        {trade.poke}
                      </td>
                      <td className="px-10">
                        <Image
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                          alt={trade.recipientpoke}
                          width={48}
                          height={48}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}
                        />
                        {trade.recipientpoke}
                      </td>
                      <td className="px-10">
                        <Button
                          variant="success"
                          disabled={isSubmitting}
                          onClick={() => {
                            void handleAccept(trade);
                          }}>
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          disabled={isSubmitting}
                          onClick={() => {
                            void handleDeny(trade.id);
                          }}>
                          Deny
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

  const user: TradePageUser = {
    ...data,
    pokemonCollection: pokemonData ?? [],
    otherUserNames: otherUserNames ?? [],
  };

  const { data: sentTradesData } = await supabase
    .from("trades")
    .select()
    .eq("user", userName);
  const sentTrades = (sentTradesData ?? []) as Trade[];

  const { data: receivedTradesData } = await supabase
    .from("trades")
    .select()
    .eq("recipient", user.channel);
  const receivedTrades = (receivedTradesData ?? []) as Trade[];
  return {
    props: {
      user: user,
      sentTrades: sentTrades,
      receivedTrades: receivedTrades,
    },
  };
};
