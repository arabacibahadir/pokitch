import { Gamepad2, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { name: "Collections", path: "/collections" },
  { name: "Gift", path: "/gift" },
  { name: "Trade", path: "/trade" },
];

export default function Header() {
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
        </nav>

        <details className="group relative tablet:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md transition hover:bg-muted [&::-webkit-details-marker]:hidden">
            <Menu className="size-5 group-open:hidden" />
            <X className="hidden size-5 group-open:block" />
            <span className="sr-only">Toggle navigation</span>
          </summary>
          <div className="absolute right-0 top-12 w-64 border-2 border-border bg-background p-3 shadow-[6px_6px_0_oklch(0.1_0.02_274)]">
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
      <span className="pixel-corners inline-flex size-9 items-center justify-center bg-primary text-primary-foreground">
        <Image src="/favicon.ico" alt="" width={24} height={24} />
      </span>
      <span className="text-xl font-black tracking-tight">POKITCH</span>
      <span className="hidden items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-300 laptop:inline-flex">
        <Gamepad2 className="size-3" /> Live game
      </span>
    </Link>
  );
}
