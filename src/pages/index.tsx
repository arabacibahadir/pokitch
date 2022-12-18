import FeaturesHomePage from "@/components/FeaturesHomePage";
import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import Layout from "@/components/Layout";
import { supabase } from "@/utils/supabase";
import { GetServerSideProps } from "next";

export default function Home({ user }: { user: any }) {
  return (
    <Layout>
      <HeroHomePage user={user} />
      <FeaturesHomePage />
      <HowToUseHomePage />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.query.id as string;

  const { data } = await supabase
    .from("accounts")
    .select()
    .eq("id", id)
    .single();

  const user = id ? data : null;
  if (id && !user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: user,
    },
  };
};
