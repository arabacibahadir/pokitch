import FeaturesHomePage from "@/components/FeaturesHomePage";
import ChatCommandsHomePage from "@/components/ChatCommandsHomePage";
import HeroHomePage from "@/components/HeroHomePage";
import HowToUseHomePage from "@/components/HowToUseHomePage";
import { getCurrentAccount } from "@/features/auth/queries";

export default async function HomePage() {
  const account = await getCurrentAccount();
  const user = account
    ? { id: account.id, channel: account.channel ?? "Streamer" }
    : null;

  return (
    <>
      <HeroHomePage user={user} />
      <FeaturesHomePage />
      <HowToUseHomePage />
      <ChatCommandsHomePage />
    </>
  );
}
