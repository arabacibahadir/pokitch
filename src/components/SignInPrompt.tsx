import { LogIn } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { signInWithTwitch } from "@/features/auth/actions";

export function SignInPrompt({
  destination,
  title,
  description,
}: {
  destination: "/gift" | "/trade";
  title: string;
  description: string;
}) {
  return (
    <Card className="game-panel max-w-2xl border-2 shadow-none">
      <CardHeader>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert>
          <LogIn />
          <AlertTitle>Twitch sign-in required</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
        <form action={signInWithTwitch}>
          <input type="hidden" name="next" value={destination} />
          <Button type="submit" variant="primary">
            <LogIn data-icon="inline-start" /> Sign in with Twitch
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
