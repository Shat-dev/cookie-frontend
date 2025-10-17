import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLAY $COOKIE",
  description: "A ERC-404 Project",
  keywords: ["ERC-404", "lottery", "web3", "blockchain", "Cookie"],
  authors: [{ name: "CookieBNB.xyz Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
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
