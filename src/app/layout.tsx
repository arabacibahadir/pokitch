import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "@/styles/globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-custom",
});

export const metadata: Metadata = {
  title: "Pokitch — Twitch Chat Pokémon Game",
  description:
    "A Twitch chat game for catching, gifting, and trading Pokémon with a live OBS overlay.",
  keywords: ["Twitch", "chat game", "Pokémon", "OBS overlay"],
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={openSans.variable}>
      <body>{children}</body>
    </html>
  );
}
