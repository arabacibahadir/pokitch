import GiftRecipientDropdown from "@/components/GiftRecipientDropdown";
import Layout from "@/components/Layout";
import PokemonCard from "@/components/PokeCard";
import UserPokemonsDropdown from "@/components/UserPokemonsDropdown";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
interface Trade {
  id: number;
  user: string;
  poke: string;
  pokeid: number;
  recipient: string;
  recipientpoke: string;
  recipientpokeid: number;
}
export default function Gift({
  user,
  sentTrades,
  receivedTrades,
}: {
  user: any;
  sentTrades: any;
  receivedTrades: any;
}) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [pokemonID, setPokemonID] = useState("");
  const [pokemonTradeID, setPokemonTradeID] = useState("");
  const [recipientPokemons, setRecipientPokemons] = useState<any>([]);
  const [pokemonTradeName, setPokemonTradeName] = useState("");
  const router = useRouter();
  const [selectedTrades, setSelectedTrades] = useState([]);
  const [showSentOffers, setShowSentOffers] = useState(true);
  const [isRotated, setIsRotated] = useState(false);
  const [hoveredPokemon, setHoveredPokemon] = useState<string | null>(null);
  function handleCancel(tradeID: any) {
    const cancelTrade = async () => {
      const { error } = await supabase
        .from("trades")
        .delete()
        .match({ id: tradeID });
      if (error) {
        console.log("remove error", error);
      } else {
        setSelectedTrades((prevSelectedTrades) =>
          prevSelectedTrades.filter((trade: Trade) => trade.id !== tradeID),
        );
      }
    };
    cancelTrade();
  }

  function handleAccept(
    tradeID: any,
    pokemonID: any,
    giftRecipientID: any,
    offererTwitchName: any,
    userTwitchName: any,
    offeredPokemon: any,
    myPokeItem: any,
  ) {
    const removeMyPokemon = async () => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .match({ id: giftRecipientID });
      if (error) {
        console.log("remove error", error);
      }
    };
    const removeOffererPokemon = async () => {
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
          poke: offeredPokemon,
          user: user.channel,
          channel: offererTwitchName,
        },
      ]);
      if (error) {
        console.log("add error", error);
      }
    };
    const addOffererPokemon = async () => {
      const { error } = await supabase.from("collections").insert([
        {
          poke: myPokeItem,
          user: offererTwitchName,
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
        .match({ id: tradeID });
      if (error) {
        console.log("remove error", error);
      }
    };
    removeMyPokemon();
    removeOffererPokemon();
    addMyPokemon();
    addOffererPokemon();
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
      const { data: existingTrade } = await supabase
        .from("trades")
        .select("id")
        .eq("pokeid", pokemonID)
        .eq("user", user.channel)
        .single();

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
        {hoveredPokemon && (
          <div className="fixed left-20 z-10 -translate-x-1/2 translate-y-1/3 transform shadow-2xl">
            <PokemonCard poke={hoveredPokemon} />
          </div>
        )}
        <div className="container flex flex-row justify-center space-x-8">
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
            className="mt-5 "
            onClick={() => {
              handleTrade();
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
                        <img
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                          alt={trade.poke}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}></img>
                        {trade.poke}
                      </td>
                      <td className="px-10">{trade.recipient}</td>
                      <td className="px-10">
                        <img
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                          alt={trade.recipientpoke}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}></img>
                        {trade.recipientpoke}
                      </td>
                      <td className="px-10">
                        <Button
                          variant="danger"
                          onClick={() => {
                            handleCancel(trade.id);
                            router.replace(router.asPath);
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
                        <img
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.poke}.gif`}
                          alt={trade.poke}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}></img>
                        {trade.poke}
                      </td>
                      <td className="px-10">
                        <img
                          src={`https://projectpokemon.org/images/normal-sprite/${trade.recipientpoke}.gif`}
                          alt={trade.recipientpoke}
                          className="mr-2 inline-block max-h-12 w-12 object-contain object-center"
                          onMouseEnter={() => setHoveredPokemon(trade.poke)}
                          onMouseLeave={() => setHoveredPokemon(null)}></img>
                        {trade.recipientpoke}
                      </td>
                      <td className="px-10">
                        <Button
                          variant="success"
                          onClick={() => {
                            handleAccept(
                              trade.id,
                              trade.pokeid,
                              trade.recipientpokeid,
                              trade.user,
                              trade.recipient,
                              trade.poke,
                              trade.recipientpoke,
                            );
                            router.replace(router.asPath);
                          }}>
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            handleDeny(trade.id);
                            router.replace(router.asPath);
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

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { data: sentTradesData } = await supabase
    .from("trades")
    .select()
    .eq("user", session?.user.user_metadata.name);
  const sentTrades = sentTradesData ? sentTradesData : null;

  const { data: receivedTradesData } = await supabase
    .from("trades")
    .select()
    .eq("recipient", user?.channel);
  const receivedTrades = receivedTradesData ? receivedTradesData : null;
  return {
    props: {
      user: user,
      sentTrades: sentTrades,
      receivedTrades: receivedTrades,
    },
  };
};
