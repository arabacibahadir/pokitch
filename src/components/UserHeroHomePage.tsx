import { LogOut } from "lucide-react";
import Link from "next/link";

import { StreamerSetup } from "@/components/StreamerSetup";
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

        <StreamerSetup accountId={data.id} url={url} />

        <Separator />

        <form action={signOut}>
          <Button variant="outline" type="submit">
            <LogOut data-icon="inline-start" /> Log out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
