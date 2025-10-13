import type { Metadata } from "next";
import "./globals.css";
import { CountdownProvider } from "@/context/CountdownContext";

export const metadata: Metadata = {
  title: "PLAY $COOKIE",
  description: "A ERC-404 Project",
  keywords: ["ERC-404", "lottery", "web3", "blockchain", "Cookie"],
  authors: [{ name: "Playcookie.xyz Team" }],
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
      <body className="antialiased">
        <CountdownProvider>{children}</CountdownProvider>
      </body>
    </html>
  );
}
//
