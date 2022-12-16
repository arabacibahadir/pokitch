import "@/styles/globals.css";
import { JetBrains_Mono } from "@next/font/google";
import type { AppProps } from "next/app";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbm",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className={`${jetBrainsMono.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
