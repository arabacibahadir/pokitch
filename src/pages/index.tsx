import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <HeroHomePage />
      <HowToUseHomePage />
    </Layout>
  );
}
