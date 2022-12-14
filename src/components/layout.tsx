import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <>
      {/* Header */}

      {/* Main */}
      <main>{children}</main>

      {/* Footer */}
    </>
  );
}
