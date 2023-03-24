/* eslint-disable @next/next/no-img-element */

import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/utils/supabase";
import type { GetServerSideProps } from "next";

type Props = {
  user: string | null;
  channel: string | null;
  collections: any;
};

export default function Gift({ user, channel, collections }: Props) {
  return (
    <Layout>
      <section className="py-12 tablet:py-24">
        <div className="container">
          <div className="space-y-6">
            <SearchBar />
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
