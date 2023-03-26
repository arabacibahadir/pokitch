import Layout from "@/components/Layout";
import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Gift({ user }: { user: any }) {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [selectedPokemonName, setSelectedPokemonName] = useState("");
  const uniqueUserNames = new Set(
    user.otherUserNames.map((userName: any) => userName.user)
  );
  const count = user.pokemonCollection ? user.pokemonCollection.length : 0;
  const router = useRouter();
  function handleDropdownToggle() {
    setIsDropdownOpen((prevIsOpen) => !prevIsOpen);
  }

  function handleOutsideClick(e: any) {
    if (e.target.closest("#dropdown") === null) {
      setIsDropdownOpen(false);
      setIsUserDropdownOpen(false);
    }
  }
  function handleUserDropdownToggle() {
    setIsUserDropdownOpen((prevIsOpen) => !prevIsOpen);
  }

  function handleGift() {
    const removePokemon = async () => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .match({ id: selectedPokemon, user: user.channel });

      if (error) {
        console.log("remove error", error);
      }
    };
    const addPokemon = async () => {
      const { error } = await supabase.from("collections").insert([
        {
          poke: selectedPokemonName,
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

    setSelectedPokemonName("");
    setSelectedPokemon("");
    setGiftRecipient("");
    router.replace(router.asPath);
  }

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick, true);
    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
    };
  }, []);
  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <div className="container container flex flex-row space-x-4">
          <div className="space-y-6">
            {user.pokemonCollection ? (
              <div>
                <p>Your collection: {count}</p>
                <div className="relative">
                  <button
                    id="dropdownDefaultButton"
                    data-dropdown-toggle="dropdown"
                    className="inline-flex items-center rounded-lg bg-amber-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:focus:ring-amber-500"
                    type="button"
                    style={{
                      minWidth: "200px",
                      width: "200px",
                      height: "60px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onClick={handleDropdownToggle}
                  >
                    {selectedPokemonName
                      ? selectedPokemonName
                      : "Select Pokemon"}
                    <img
                      src={`https://projectpokemon.org/images/normal-sprite/${selectedPokemonName}.gif`}
                      alt={selectedPokemonName}
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                        maxWidth: "40px",
                        maxHeight: "40px",
                      }}
                      className="inline-block"
                    />
                    <svg
                      className="h-4 w-4"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div
                      id="dropdown"
                      className="absolute z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700"
                    >
                      <ul
                        className="relative max-h-80 gap-4 overflow-y-auto overflow-x-hidden py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="dropdownDefaultButton"
                      >
                        {user.pokemonCollection
                          .sort((a: any, b: any) =>
                            a.poke.localeCompare(b.poke)
                          )
                          .map((pokemon: any) => (
                            <li key={pokemon.poke}>
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                type="button"
                                onClick={() => {
                                  setSelectedPokemon(pokemon.id);
                                  setSelectedPokemonName(pokemon.poke);
                                  handleDropdownToggle();
                                }}
                              >
                                <div className="flex">
                                  <div
                                    style={{
                                      minWidth: "80px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <div className="m-2">{pokemon.poke}</div>
                                  </div>
                                  <img
                                    src={`https://projectpokemon.org/images/normal-sprite/${pokemon.poke}.gif`}
                                    alt={selectedPokemon}
                                    style={{
                                      objectFit: "contain",
                                      objectPosition: "center",
                                      maxWidth: "40px",
                                      maxHeight: "40px",
                                    }}
                                    className="ml-5 inline-block"
                                  />
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>No Pokemon found in collection.</p>
            )}
          </div>

          {user.otherUserNames && (
            <div>
              <p>Gift recipient</p>
              <div className="relative">
                <button
                  id="dropdownOtherUserButton"
                  data-dropdown-toggle="dropdown"
                  className="inline-flex items-center rounded-lg bg-amber-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:focus:ring-amber-500"
                  type="button"
                  onClick={handleUserDropdownToggle}
                  style={{
                    minWidth: "200px",
                    width: "200px",
                    height: "60px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {giftRecipient ? giftRecipient : "Select user"}
                  <svg
                    className="ml-2 h-4 w-4"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isUserDropdownOpen && (
                  <div
                    id="dropdown"
                    className="absolute z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700"
                  >
                    <ul
                      className="relative max-h-80 overflow-y-auto overflow-x-hidden text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="dropdownOtherUserButton"
                    >
                      {Array.from(uniqueUserNames)
                        .sort((a: any, b: any) => a.localeCompare(b))
                        .map((userName: any) => (
                          <li key={userName}>
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                              type="button"
                              onClick={() => {
                                setGiftRecipient(userName);
                                handleUserDropdownToggle();
                              }}
                            >
                              {userName}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <Button
            className="w-30 mt-8 flex h-10 items-center justify-between"
            onClick={() => {
              handleGift();
            }}
          >
            Gift pokemon
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
