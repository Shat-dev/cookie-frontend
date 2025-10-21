import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLAY $COOKIE 饼干",
  description: "The first BSC Lottery. Immutable, automated, always fair ",
  keywords: ["ERC-404", "lottery", "web3", "blockchain", "Cookie"],
  authors: [{ name: "CookieBNB.xyz Team" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
//
