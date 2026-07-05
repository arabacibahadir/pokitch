"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserRound, ChevronDown, Settings2, LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";

export default function UserDropdown({
  channel,
  mobile = false,
}: {
  channel: string;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-card/70 px-3 py-2 text-sm hover:bg-muted/50 transition select-none"
      >
        <UserRound className="size-4 text-primary" />
        <span className="max-w-32 truncate font-semibold">{channel}</span>
        <ChevronDown className={`size-3 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute z-50 w-48 rounded-lg border border-border bg-card p-1.5 shadow-md flex flex-col gap-1 mt-1 ${mobile ? "left-0" : "right-0"}`}>
          <Link
            href={`/collections?mode=user&q=${channel}`}
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-xs font-semibold hover:bg-muted transition text-left flex items-center gap-1.5 text-foreground"
          >
            <UserRound className="size-3.5 text-primary" />
            My Pokémon
          </Link>
          <Link
            href="/setup"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-xs font-semibold hover:bg-muted transition text-left flex items-center gap-1.5 text-foreground"
          >
            <Settings2 className="size-3.5 text-primary" />
            Setup
          </Link>
          <div className="border-t border-border my-1" />
          <form action={signOut} onSubmit={() => setOpen(false)} className="w-full">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition text-left flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" /> Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
