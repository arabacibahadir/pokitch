import RootLayout from "@/components/layout";
import Button from "@/components/ui/Button";
import { TwitchIcon } from "@/components/ui/Icons";
import { twitch } from "@/utils/twitch";
import Link from "next/link";

export default function Home() {
  return (
    <RootLayout>
      <div className="flex h-screen items-center justify-center">
        <Link href={twitch.createAuhotizeUrl()}>
          <Button startIcon={<TwitchIcon />}>Sign in with Twitch</Button>
        </Link>
      </div>
    </RootLayout>
  );
}
