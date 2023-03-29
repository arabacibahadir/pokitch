import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { FaTwitch } from "react-icons/fa";

export default function GuestHeroHomePage() {
  async function signInWithTwitch() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitch",
      //FIX ME: redirect to the current page
    });
    if (error) console.log(error);
  }

  return (
    <Button variant="twitch" onClick={signInWithTwitch}>
      <FaTwitch style={{ marginRight: "8px" }} /> Sign in with Twitch
    </Button>
  );
}
