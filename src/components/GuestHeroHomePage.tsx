import { Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signInWithTwitch } from "@/features/auth/actions";

export default function GuestHeroHomePage() {
  return (
    <div className="flex">
      <form action={signInWithTwitch}>
        <Button
          className="h-12 border-2 px-6 font-bold shadow-[4px_4px_0_#2d1764]"
          variant="twitch"
          size="lg"
          type="submit"
        >
          <Radio className="size-5" />
          Sign in with Twitch
        </Button>
      </form>
    </div>
  );
}
