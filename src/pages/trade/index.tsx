import GiftRecipientDropdown from "@/components/GiftRecipientDropdown";
import Layout from "@/components/Layout";
import UserPokemonsDropdown from "@/components/UserPokemonsDropdown";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
interface Trade {
  id: any;
  user: any;
  poke: any;
  pokeid: any;
  recipient: any;
  recipientpoke: any;
  recipientpokeid: any;
}
export default function Gift({
  user,
  trades,
  trades2,
}: {
  user: any;
  trades: any;
  trades2: any;
}) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [pokemonID, setPokemonID] = useState("");
  const [pokemonTradeID, setPokemonTradeID] = useState("");
  const [recipientPokemons, setRecipientPokemons] = useState<any>([]);
  const [pokemonTradeName, setPokemonTradeName] = useState("");
  const router = useRouter();
  const [selectedTrades, setSelectedTrades] = useState([]);

  if (!user) {
    router.push("/");
    return null;
  }
  function handleCancel(tradeId: any) {
    const cancelTrade = async () => {
      const { error } = await supabase
        .from("trades")
        .delete()
        .match({ id: tradeId });
      if (error) {
        console.log("remove error", error);
      } else {
        // remove the canceled trade from the list of selected trades
        setSelectedTrades((prevSelectedTrades) =>
          prevSelectedTrades.filter((trade: Trade) => trade.id !== tradeId)
        );
      }
    };
    // console.log("canceling trade", tradeId);
    cancelTrade();
  }

  function handleAccept(
    tradeId: any,
    pokemonID: any,
    giftRecipient: any,
    pokemonTradeID: any,
    pokemonTradeName: any,
    selectedPokemon: any,
    trade: any
  ) {
    const removeMyPokemon = async () => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .match({ id: giftRecipient });
      if (error) {
        console.log("remove error", error);
      }
    };
    const removeTheirPokemon = async () => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .match({ id: pokemonID });
      if (error) {
        console.log("remove error", error);
      }
    };
    const addMyPokemon = async () => {
      const { error } = await supabase.from("collections").insert([
        {
          poke: selectedPokemon,
          user: user.channel,
          channel: pokemonTradeID,
        },
      ]);
      if (error) {
        console.log("add error", error);
      }
    };
    const addTheirPokemon = async () => {
      const { error } = await supabase.from("collections").insert([
        {
          poke: trade,
          user: pokemonTradeID,
          channel: user.channel,
        },
      ]);
      if (error) {
        console.log("add error", error);
      }
    };

    const acceptTrade = async () => {
      const { error } = await supabase
        .from("trades")
        .delete()
        .match({ id: tradeId });
      if (error) {
        console.log("remove error", error);
      }
    };
    removeMyPokemon();
    removeTheirPokemon();
    addMyPokemon();
    addTheirPokemon();
    acceptTrade();
  }

  function handleDeny(tradeId: any) {
    const denyTrade = async () => {
      const { error } = await supabase
        .from("trades")
        .delete()
        .match({ id: tradeId });
      if (error) {
        console.log("remove error", error);
      }
    };
    console.log("denying trade", tradeId);
    denyTrade();
  }
  function handleTrade() {
    if (!pokemonID || !giftRecipient || !pokemonTradeID || !pokemonTradeName) {
      console.log("missing data");
      return;
    }

    const tradeRequest = async () => {
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
      }
    };
    tradeRequest();
    setSelectedPokemon("");
    setGiftRecipient("");
    router.replace(router.asPath);
  }

  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <h1>Trade</h1>
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
            onChange={async (selectedUser: SetStateAction<string>) => {
              setGiftRecipient(selectedUser);

              const { data: recipientPokemonsData } = await supabase
                .from("collections")
                .select()
                .eq("user", selectedUser);

              setRecipientPokemons(recipientPokemonsData);
            }}
          />
          <UserPokemonsDropdown
            key={recipientPokemons}
            user={{ pokemonCollection: recipientPokemons }}
            onChange={(selectedPokemon, pokemonTradeID) => {
              setPokemonTradeID(pokemonTradeID);
              setPokemonTradeName(selectedPokemon);
            }}
          />
          <Button
            className="mt-5"
            onClick={() => {
              handleTrade();
            }}
          >
            <div className="inline-flex items-center space-x-2">
              <span>Trade request</span>
            </div>
          </Button>
        </div>
        <h2 className="mb-2 text-xl font-bold">Sent Trade offers</h2>
        <table className="w-full">
          <thead>
            <tr className="">
              <th className="p-3 text-left">My Offered Pokemon</th>
              <th className="p-3 text-left">User I'm Offering to</th>
              <th className="p-3 text-left">Their Pokemon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trades.map((trade: Trade) => (
              <tr key={trade.id}>
                <td className="p-3">
                  <img
                    src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                    alt={trade.poke}
                    className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                  />
                  {trade.poke}{" "}
                </td>
                <td className="p-3">{trade.recipient}</td>
                <td className="p-3">
                  <img
                    src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                    alt={trade.recipientpoke}
                    className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                  />
                  {trade.recipientpoke}{" "}
                </td>
                <td className="p-3">
                  <Button
                    className=""
                    onClick={() => {
                      handleCancel(trade.id);
                      router.replace(router.asPath);
                    }}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mb-2 text-xl font-bold">Received Trade offers</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left">Offerer</th>
              <th className="p-3 text-left">Their Offered Pokemon</th>
              <th className="p-3 text-left">Requested Pokemon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trades2.map((trade: Trade) => (
              <tr key={trade.id}>
                <td className="p-3">{trade.user}</td>
                <td className="p-3">
                  <img
                    src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                    alt={trade.poke}
                    className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                  />
                  {trade.poke}{" "}
                </td>
                <td className="p-3">
                  <img
                    src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                    alt={trade.recipientpoke}
                    className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                  />
                  {trade.recipientpoke}{" "}
                </td>
                <td className="p-3">
                  <Button
                    className=""
                    onClick={() => {
                      handleAccept(
                        trade.id,
                        trade.pokeid,
                        trade.recipientpokeid,
                        trade.user,
                        trade.recipient,
                        trade.poke,
                        trade.recipientpoke
                      );
                      router.replace(router.asPath);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    className=""
                    onClick={() => {
                      handleDeny(trade.id);
                      router.replace(router.asPath);
                    }}
                  >
                    Deny
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const { data: tradesData } = await supabase
    .from("trades")
    .select()
    .eq("user", session?.user.user_metadata.name);
  const trades = tradesData ? tradesData : null;

  const { data: tradesData2 } = await supabase
    .from("trades")
    .select()
    .eq("recipient", user?.channel);
  const trades2 = tradesData2 ? tradesData2 : null;
  return {
    props: {
      user: user,
      trades: trades,
      trades2: trades2,
    },
  };
};
