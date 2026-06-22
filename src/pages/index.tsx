import FeaturesHomePage from "@/components/FeaturesHomePage";
import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import Layout from "@/components/Layout";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
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
  const supabase = createPagesServerClient(ctx, {
    cookieOptions: {
      name: "sb-access-token",
      path: "/",
      domain: undefined,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
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
