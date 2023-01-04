/* eslint-disable @next/next/no-img-element */

import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import Heading from "@/ui/Heading";
import { Table, Td, Th, Thead, Tr } from "@/ui/Table";
import { supabase } from "@/utils/supabase";
import type { GetServerSideProps } from "next";

type Props = {
  user: string | null;
  channel: string | null;
  collections: any;
};

export default function Inventory({ user, channel, collections }: Props) {
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
                        {user ? user+"'s" : channel+" Twitch Channel"} Inventory
                      </Heading>
                      <div className="text-sm font-normal text-gray-300">
                        <p>
                          On this page, you can see pokes that you have caught.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Heading variant="h3">Latest Caught Pokes</Heading>
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
                  {collections.map((collection: any, index: number) => (
                    <Tr key={collection.id}>
                      <Td>{index + 1}</Td>
                      <Td>
                        <figure className="inline-flex h-14 w-14 shrink-0 justify-center">
                          <img
                            src={`https://projectpokemon.org/images/normal-sprite/${collection.poke}.gif`}
                            alt=""
                          />
                        </figure>
                      </Td>
                      <Td>{collection.poke}</Td>
                      <Td>{collection.user}</Td>
                      <Td>{collection.channel}</Td>
                      <Td>
                        {new Date(collection.created_at).toLocaleString(
                          "en-GB"
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
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
