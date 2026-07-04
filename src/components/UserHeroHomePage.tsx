import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/features/auth/actions";

export default function UserHeroHomePage({
  data,
}: {
  data: { id: string; channel: string };
}) {
  return (
    <Card className="game-panel border-2 border-border bg-card text-left shadow-none">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-2xl font-bold">Welcome, {data.channel}!</h2>
          <p className="text-sm text-muted-foreground">
            Your stream setup is ready when you are. Open your setup page to
            copy the overlay URL and finish the OBS checklist.
          </p>
        </div>

        <div>
          <Button asChild variant="primary">
            <Link
              href="/setup"
            >
              Open setup page
            </Link>
          </Button>
        </div>

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
