/* eslint-disable @next/next/no-img-element */
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import { Table, Td, Th, Thead, Tr } from "@/ui/Table";
import { supabase } from "@/utils/supabase";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiX } from "react-icons/fi";

type Props = {
  user: string | null;
  channel: string | null;
  collections: any;
  poke: string | null;
};

export default function Inventory({ user, channel, collections, poke }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 50;
  const totalPokemons = collections.length;
  const totalPages = Math.ceil(totalPokemons / pokemonsPerPage);
  const router = useRouter();
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
                  {user || channel || poke ? (
                    <>
                      <div className="flex justify-between">
                        <Heading variant="h3">
                          <Button
                            variant="primary"
                            className="left-0 mt-2 ml-2"
                            onClick={() => {
                              router.push("/collections");
                            }}>
                            <FiX className="h-4 w-4" />
                          </Button>
                          {user
                            ? user + "'s Collection"
                            : channel === "Pokemon"
                            ? "Pokemon Collection"
                            : poke}
                        </Heading>
                        <Heading variant="h4">Total: {totalPokemons}</Heading>
                      </div>
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
                        <Td>
                          <a
                            href={`/collections?poke=${encodeURIComponent(
                              collection.poke,
                            )}`}>
                            <span className="decoration-amber-400 hover:underline">
                              {collection.poke}
                            </span>
                          </a>
                        </Td>
                        <Td>
                          <a
                            href={`/collections?user=${encodeURIComponent(
                              collection.user,
                            )}`}>
                            <span className="decoration-amber-400 hover:underline">
                              {collection.user}
                            </span>
                          </a>
                        </Td>
                        <Td>
                          <a
                            href={`/collections?channel=${encodeURIComponent(
                              collection.channel,
                            )}`}>
                            <span className="decoration-amber-400 hover:underline">
                              {collection.channel}
                            </span>
                          </a>
                        </Td>
                        <Td>
                          {new Date(collection.created_at).toLocaleString(
                            "en-GB",
                          )}
                        </Td>
                      </Tr>
                    ),
                  )}
                </tbody>
              </Table>
              <div className="mt-4 flex justify-between">
                <div>
                  <span className="mr-2">Page:</span>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant="primary"
                      className={`rounded-full px-2 py-1 hover:bg-orange-700 ${
                        currentPage === i + 1 ? "bg-orange-700 text-white" : ""
                      }`}
                      onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <div>
                  <Button
                    variant="primary"
                    className={`mr-2 rounded-full bg-yellow-600 px-3 py-2 ${
                      currentPage === 1 ? "" : "hover:bg-orange-600"
                    }`}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}>
                    Prev
                  </Button>
                  <Button
                    variant="primary"
                    className={`mr-2 rounded-full bg-yellow-600 px-3 py-2 ${
                      currentPage === totalPages ? "" : "hover:bg-orange-600"
                    }`}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                  </Button>
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
  const poke = ctx.query.poke as string;

  //
  if (!user && !channel && !poke) {
    const { data } = await supabase
      .from("collections")
      .select()
      .order("created_at", { ascending: false });

    return {
      props: {
        poke: null,
        user: null,
        channel: null,
        collections: data,
      },
    };
  }

  const { data } = await supabase
    .from("collections")
    .select()
    .or(`user.eq.${user},channel.eq.${channel},poke.eq.${poke}`)
    .order("created_at", { ascending: false });

  return {
    props: {
      poke: poke ? poke : null,
      user: user ? user : null,
      channel: channel ? channel : null,
      collections: data,
    },
  };
};
