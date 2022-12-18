import "@/styles/globals.css";
import { Open_Sans } from "@next/font/google";
import { cx } from "class-variance-authority";
import type { AppProps } from "next/app";
import Head from "next/head";

const customFont = Open_Sans({
  subsets: ["latin"],
  variable: "--font-custom",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Pokitch - The Twitch-integrated Poke Catching Game with Chat
        </title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <div className={cx("font-sans", customFont.variable)}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
