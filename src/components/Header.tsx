import { LogIn, Menu, Settings2, UserRound, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentAccount } from "@/features/auth/queries";

const menuItems = [
  { name: "Collections", path: "/collections" },
  { name: "Gift", path: "/gift" },
  { name: "Trade", path: "/trade" },
];

export default async function Header() {
  const account = await getCurrentAccount();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/85 backdrop-blur-xl">
      <div className="container flex min-h-16 items-center justify-between gap-4 py-3">
        <Brand />
        <nav className="hidden items-center gap-1 rounded-lg border border-border bg-card/70 p-1 tablet:flex">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              {item.name}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-border flex items-center">
            <HeaderAccount channel={account?.channel ?? null} />
          </div>
        </nav>

        <details className="group relative tablet:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md transition hover:bg-muted [&::-webkit-details-marker]:hidden">
            <Menu className="size-5 group-open:hidden" />
            <X className="hidden size-5 group-open:block" />
            <span className="sr-only">Toggle navigation</span>
          </summary>
          <div className="pixel-shadow absolute right-0 top-12 w-72 border-2 border-border bg-background p-3">
            <div className="mb-3 border-b border-border pb-3">
              <HeaderAccount channel={account?.channel ?? null} mobile />
            </div>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-base font-semibold transition hover:bg-muted"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span
        className="pokeball-mark inline-flex size-9 items-center justify-center"
        aria-hidden="true"
      >
        <span className="pokeball-mark__button" />
      </span>
      <span className="text-xl font-black tracking-tight">POKITCH</span>
    </Link>
  );
}

function HeaderAccount({
  channel,
  mobile = false,
}: {
  channel: string | null;
  mobile?: boolean;
}) {
  if (!channel) {
    return (
      <div
        className={
          mobile ? "flex flex-col gap-2" : "flex items-center gap-2"
        }
      >
        <Button asChild variant="outline" size={mobile ? "default" : "sm"}>
          <Link href="/setup">
            <LogIn data-icon="inline-start" /> Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      <Link
        href={`/collections?mode=user&q=${channel}`}
        className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm hover:bg-muted/50 transition ${
          mobile ? "" : "tablet:order-last"
        }`}
      >
        <UserRound className="size-4 text-primary" />
        <span className="max-w-32 truncate font-semibold">{channel}</span>
      </Link>
      <Button
        asChild
        variant="primary"
        size={mobile ? "default" : "sm"}
        className={mobile ? "" : "tablet:order-first"}
      >
        <Link href="/setup">
          <Settings2 data-icon="inline-start" /> Setup
        </Link>
      </Button>
    </div>
  );
}
