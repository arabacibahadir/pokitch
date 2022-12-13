import RootLayout from "@/components/layout";
import Button from "@/components/ui/Button";
import { twitch } from "@/utils/twitch";
import Link from "next/link";

export default function Home() {
  return (
    <RootLayout>
      <div className="flex h-screen items-center justify-center">
        <Link href={twitch.createAuhotizeUrl()}>
          <Button>Signin with Twitch</Button>
        </Link>
      </div>
    </RootLayout>
  );
}
