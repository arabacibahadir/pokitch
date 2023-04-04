import Button from "@/ui/Button";
import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import { FaTwitch } from "react-icons/fa";

export default function GuestHeroHomePage() {
  async function signInWithTwitch() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitch",
    });
    if (error) console.log(error);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.cookie.includes("supabase-auth-token")) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button variant="twitch" onClick={signInWithTwitch}>
      <FaTwitch style={{ marginRight: "8px" }} /> Sign in with Twitch
    </Button>
  );
}
