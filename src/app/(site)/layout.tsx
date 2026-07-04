import Script from "next/script";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-M9M9DRV5PT"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-M9M9DRV5PT');
        `}
      </Script>
    </div>
  );
}
