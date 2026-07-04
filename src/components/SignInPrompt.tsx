import { LogIn, ShieldAlert, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithTwitch } from "@/features/auth/actions";

export function SignInPrompt({
  destination,
  title,
  description,
}: {
  destination: "/gift" | "/trade" | "/setup";
  title: string;
  description: string;
}) {
  return (
    <Card className="game-panel max-w-2xl border-2 shadow-none">
      <CardHeader className="gap-4 px-5 pt-5 text-center tablet:px-7 tablet:pt-7">
        <div className="flex flex-col items-center gap-4">
          <div className="space-y-2">
            <p className="game-kicker">Quest gate</p>
            <CardTitle className="text-3xl font-black tracking-tight tablet:text-4xl">
              {title}
            </CardTitle>
          </div>
          <div className="media-surface flex size-14 shrink-0 items-center justify-center border-2 border-border">
            <ShieldAlert className="size-7 text-primary" />
          </div>
        </div>
        <CardDescription className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-5 pb-5 text-center tablet:px-7 tablet:pb-7">
        <div className="grid gap-2 border-2 border-border bg-muted/35 p-4">
          <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            Terminal locked
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Twitch account to access collector actions and keep
            transfers tied to your identity.
          </p>
        </div>
        <form action={signInWithTwitch} className="flex justify-center">
          <input type="hidden" name="next" value={destination} />
          <Button type="submit" variant="primary">
            <LogIn data-icon="inline-start" /> Sign in with Twitch
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
