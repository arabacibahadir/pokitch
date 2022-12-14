import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="flex h-full min-h-screen w-full flex-col bg-neutral-900 text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
