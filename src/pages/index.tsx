import FeaturesHomePage from "@/components/FeaturesHomePage";
import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import Layout from "@/components/Layout";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { GetServerSideProps } from "next";

type HomeUser = {
  id: string;
  channel: string;
};

export default function Home({ user }: { user: HomeUser | null }) {
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
