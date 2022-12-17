import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cx } from "class-variance-authority";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div
      id="wrapper"
      className={cx(
        "flex h-full min-h-screen w-full flex-col bg-black bg-gradient-to-b from-yellow-600 via-neutral-900 text-white"
      )}
    >
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
