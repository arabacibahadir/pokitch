import FeaturesHomePage from "@/components/FeaturesHomePage";
import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import Layout from "@/components/Layout";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
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
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", session?.user?.id)
    .single();

  const user = data ? data : null;
  return {
    props: {
      user: user,
    },
  };
};
