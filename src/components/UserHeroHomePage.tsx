import { LogOut } from "lucide-react";
import Link from "next/link";

import OverlayControls from "@/components/OverlayControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/features/auth/actions";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  `http://localhost:${process.env.PORT ?? 3000}`;

export default function UserHeroHomePage({
  data,
}: {
  data: { id: string; channel: string };
}) {
  const url = `${getBaseUrl()}/overlays/${data.id}`;

  return (
    <Card className="game-panel border-2 border-border bg-card text-left shadow-none">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-2xl font-bold">Welcome, {data.channel}!</h2>
          <p className="text-sm text-muted-foreground">
            Your overlay is ready. Follow the{" "}
            <Link
              className="font-semibold text-primary underline-offset-4 hover:underline"
              href="#how-to-use"
            >
              setup instructions
            </Link>{" "}
            before going live.
          </p>
        </div>

        <div className="grid gap-2 tablet:grid-cols-3">
          <OverlayControls url={url} />
          <form action={signOut}>
            <Button className="w-full" variant="outline" type="submit">
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Important:</span>{" "}
          grant the bot moderator status with{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">
            /mod pokitch_bot
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}
