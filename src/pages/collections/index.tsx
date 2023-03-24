/* eslint-disable @next/next/no-img-element */

import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import Heading from "@/ui/Heading";
import { Table, Td, Th, Thead, Tr } from "@/ui/Table";
import { supabase } from "@/utils/supabase";
import type { GetServerSideProps } from "next";
import { useState } from "react";

type Props = {
  user: string | null;
  channel: string | null;
  collections: any;
};

export default function Inventory({ user, channel, collections }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 50;
  const totalPokemons = collections.length;
  const totalPages = Math.ceil(totalPokemons / pokemonsPerPage);

  const getPokemonsForCurrentPage = () => {
    const lastIndex = currentPage * pokemonsPerPage;
    const firstIndex = lastIndex - pokemonsPerPage;

    if (totalPokemons < pokemonsPerPage) {
      return collections.slice(0, totalPokemons);
    }
    return collections.slice(firstIndex, lastIndex);
  };

  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <div className="container">
          <div className="space-y-6">
            <SearchBar />
            <div className="overflow-auto rounded-lg shadow">
              <Table>
                <caption className="space-y-1 bg-neutral-900/25 p-5 text-left">
                  {user || channel ? (
                    <>
                      <Heading variant="h3">
                        {user ? user + "'s" : channel + " Twitch Channel"}{" "}
                        Inventory
                      </Heading>
                      <div className="text-sm font-normal text-gray-300">
                        <p>
                          On this page, you can see pokes that you have caught.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <Heading variant="h3">Latest Caught Pokes</Heading>
                        <Heading variant="h4">Total: {totalPokemons}</Heading>
                      </div>
                      <div className="text-sm font-normal text-gray-300">
                        <p>On this page, you can see all pokes that caught.</p>
                      </div>
                    </>
                  )}
                </caption>
                <Thead>
                  <tr>
                    <Th />
                    <Th></Th>
                    <Th>Poke Name</Th>
                    <Th>User</Th>
                    <Th>Channel</Th>
                    <Th>Caught Date</Th>
                  </tr>
                </Thead>
                <tbody>
                  {getPokemonsForCurrentPage().map(
                    (collection: any, index: number) => (
                      <Tr key={collection.id}>
                        <Td>
                          {(currentPage - 1) * pokemonsPerPage + index + 1}
                        </Td>
                        <Td>
                          <figure className="inline-flex h-14 w-14 shrink-0 justify-center">
                            <img
                              src={`https://projectpokemon.org/images/normal-sprite/${collection.poke}.gif`}
                              alt=""
                              style={{
                                objectFit: "contain",
                                objectPosition: "center",
                              }}
                            />
                          </figure>
                        </Td>
                        <Td>{collection.poke}</Td>
                        <Td>
                          <a
                            href={`/collections?user=${encodeURIComponent(
                              collection.user
                            )}`}
                          >
                            {collection.user}
                          </a>
                        </Td>
                        <Td>
                          <a
                            href={`/collections?channel=${encodeURIComponent(
                              collection.channel
                            )}`}
                          >
                            {collection.channel}
                          </a>
                        </Td>
                        <Td>
                          {new Date(collection.created_at).toLocaleString(
                            "en-GB"
                          )}
                        </Td>
                      </Tr>
                    )
                  )}
                </tbody>
              </Table>
              <div className="mt-4 flex justify-between">
                <div>
                  <span className="mr-2">Page:</span>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`mr-2 rounded-full px-2 py-1 hover:bg-orange-700 ${
                        currentPage === i + 1
                          ? "bg-yellow-600 text-white"
                          : "bg-white text-gray-700"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div>
                  <button
                    className="mr-2 rounded-full bg-yellow-600 px-3 py-2 hover:bg-orange-700"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-full bg-yellow-600 px-3 py-2 hover:bg-orange-700"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = ctx.query.user as string;
  const channel = ctx.query.channel as string;

  //
  if (!user && !channel) {
    const { data } = await supabase
      .from("collections")
      .select()
      .order("created_at", { ascending: false });

    return {
      props: {
        user: null,
        channel: null,
        collections: data,
      },
    };
  }

  const { data } = await supabase
    .from("collections")
    .select()
    .or(`user.eq.${user},channel.eq.${channel}`)
    .order("created_at", { ascending: false });

  return {
    props: {
      user: user ? user : null,
      channel: channel ? channel : null,
      collections: data,
    },
  };
};
