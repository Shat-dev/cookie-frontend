import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "PLAY $COOKIE 饼干",
  description: "The first BSC Lottery. Immutable, automated, always fair ",
  keywords: ["ERC-404", "lottery", "web3", "blockchain", "Cookie"],
  authors: [{ name: "CookieBNB.xyz Team" }],
  icons: {
    icon: "/cookie.png",
    shortcut: "/cookie.png",
    apple: "/cookie.png",
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
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
//
