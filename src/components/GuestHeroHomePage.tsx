import Button from "@/components/ui/Button";
import { twitch } from "@/utils/twitch";
import Link from "next/link";
import { BsTwitch } from "react-icons/bs";

export default function GuestHeroHomePage() {
  return (
    <Link href={twitch.createAuthorizeUrl()}>
      <Button variant="twitch" startIcon={<BsTwitch />}>
        Sign in with Twitch
      </Button>
    </Link>
  );
}
