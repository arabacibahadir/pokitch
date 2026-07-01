import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">
        The Pokitch page you requested does not exist.
      </p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
