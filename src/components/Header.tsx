"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

type CurrentPage =
  | "how-to-enter"
  | "how-it-works"
  | "faq"
  | "home"
  | "current-pool"
  | "enter"
  | "404"
  | "results";

export default function Header({
  currentPage,
  isMenuOpen,
  setIsMenuOpen,
}: {
  currentPage?: CurrentPage;
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}) {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [localMenuOpen, setLocalMenuOpen] = useState(false);

  const { language, toggleLanguage, t } = useLanguage();

  // Use props if provided, otherwise fall back to local state
  const menuOpen = isMenuOpen !== undefined ? isMenuOpen : localMenuOpen;
  const toggleMenu =
    setIsMenuOpen !== undefined
      ? () => setIsMenuOpen(!menuOpen)
      : () => setLocalMenuOpen(!localMenuOpen);

  const closeMenu = useCallback(() => {
    if (setIsMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setLocalMenuOpen(false);
    }
  }, [setIsMenuOpen]);

  const pathname = usePathname();

  // Close menu when pathname changes (after navigation completes)
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Derive currentPage from router if not provided as prop
  const derivedPage =
    pathname === "/how-it-works"
      ? ("how-it-works" as CurrentPage)
      : pathname === "/faq"
      ? ("faq" as CurrentPage)
      : pathname === "/enter"
      ? ("enter" as CurrentPage)
      : pathname === "/current-pool"
      ? ("current-pool" as CurrentPage)
      : pathname === "/results"
      ? ("results" as CurrentPage)
      : ("home" as CurrentPage);

  // Normalize currentPage with prop override and defensive comparison
  const page: CurrentPage = currentPage ?? derivedPage;

  useEffect(() => {
    // Import the contract address from the constants file
    import("../../constants/contract-address.json")
      .then((data) => {
        setContractAddress(data.Cookie);
      })
      .catch((error) => {
        console.error("Failed to load contract address:", error);
        setContractAddress("0x0000...0000"); // Fallback
      });
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-[100] bg-transparent h-[80px] pt-[80px] px-4 md:relative md:px-8 py-3 md:py-6  md:h-auto">
      {/* Desktop Top Left */}
      <div className="hidden md:block absolute left-2 md:left-4 top-6 text-lg md:text-lg text-base font-semibold">
        <div className="text-[#FFFFFF] mb-1 hover:text-[#FFFFFF] transition-colors text-xs md:text-lg">
          <span className="hidden md:inline">{t.header.bscFirstLottery}</span>
        </div>
        <div
          className="text-[#FFFFFF] font-semibold hover:text-[#FFFFFF] transition-colors cursor-pointer text-xs md:text-base font-semibold"
          onClick={handleCopyAddress}
        >
          {/* Desktop: 2 lines */}
          <div className="hidden md:flex flex-col">
            <div className="transition-all duration-300 ease-in-out flex items-center gap-1">
              {copied ? (
                <>{t.common.copiedSuccessfully}</>
              ) : (
                contractAddress.slice(0, 21)
              )}
            </div>
            <div className="transition-all duration-300 ease-in-out">
              {copied ? "" : contractAddress.slice(21, 42)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Left - Title Only */}
      <div className="md:hidden absolute left-4 top-3.5 ">
        <Link href="/" className="block">
          <Image
            src="/logo.png"
            alt="CookieBNB.xyz"
            width={150}
            height={50}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Desktop Center - Title */}
      <div className="hidden md:block text-center">
        <Link href="/" className="block">
          <Image
            src="/logo.png"
            alt="CookieBNB.xyz"
            width={240}
            height={85}
            className="mx-auto hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Mobile Top Right: Language + Hamburger */}
      <div className="md:hidden absolute right-2 top-4 flex items-center space-x-3 mobile-menu-container">
        {/* Mobile Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="block text-[#FFFFFF] font-semibold hover:text-[#FFFFFF] hover:underline transition-colors text-base text-right"
          aria-label={t.language.toggleLanguage}
        >
          {language === "en" ? t.language.chinese : t.language.english}
        </button>
        <Image
          src={menuOpen ? "/cross.svg" : "/hamburger-menu.svg"}
          alt={menuOpen ? t.header.closeMenu : t.header.menu}
          width={45}
          height={45}
          className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:bg-gray-100 rounded-md p-1"
          onClick={toggleMenu}
          aria-label={menuOpen ? t.header.closeMenu : t.header.menu}
        />

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute text-right text-[#FFFFFF] font-semibold z-50 transform transition-all duration-200 ease-in-out min-w-[120px] space-y-2.5 right-3 top-16">
            <Link
              href="https://x.com/CookieBinance"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              {t.header.twitter}
            </Link>
            <Link
              href={`https://bscscan.com/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              {t.header.contract}
            </Link>

            <Link
              href={`https://dexscreener.com/bsc/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              {t.header.dexscreener}
            </Link>
            <Link
              href="/how-it-works"
              className="block hover:text-[#FFFFFF] hover:underline transition-colors text-base text-[#FFFFFF]"
            >
              {t.header.howItWorks}
            </Link>
            <Link
              href={
                language === "en"
                  ? "https://docs.cookiebnb.xyz/"
                  : "https://docs.cookiebnb.xyz/cookie-ji-shu-bai-pi-shu"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              {t.header.docs}
            </Link>

            <Link
              href="/faq"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
            >
              {t.header.faq}
            </Link>
            <Link
              href="/results"
              className="block text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors text-base"
            >
              {t.header.results}
            </Link>
          </div>
        )}
      </div>
      {/* Desktop Top Right Navigation */}
      <div className="hidden md:block absolute right-2 md:right-4 top-6 text-base md:text-lg space-y-0.25 md:space-y-1 text-right text-[#FFFFFF] font-semibold">
        <Link
          href="https://x.com/CookieBinance"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#FFFFFF] hover:underline transition-colors text-xs md:text-base"
        >
          {t.header.twitter}
        </Link>
        <Link
          href={`https://bscscan.com/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#FFFFFF] hover:underline transition-colors text-xs md:text-base"
        >
          {t.header.contract}
        </Link>
        <Link
          href={`https://dexscreener.com/bsc/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#FFFFFF] hover:underline transition-colors text-xs md:text-base"
        >
          {t.header.dexscreener}
        </Link>
        <Link
          href="/how-it-works"
          className={`block hover:text-[#FFFFFF] hover:underline transition-colors text-xs md:text-base ${
            page === "how-it-works" ? "" : ""
          }`}
        >
          {t.header.howItWorks}
        </Link>
        <Link
          href={
            language === "en"
              ? "https://docs.cookiebnb.xyz/"
              : "https://docs.cookiebnb.xyz/cookie-ji-shu-bai-pi-shu"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#FFFFFF] hover:underline transition-colors text-xs md:text-base"
        >
          {t.header.docs}
        </Link>
        <Link
          href="/faq"
          className="text-xs md:text-base text-[#FFFFFF] font-semibold hover:text-[#FFFFFF] transition-colors hover:underline"
        >
          {t.header.faq}
        </Link>
        <br />
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="text-xs md:text-base text-[#FFFFFF] font-semibold hover:text-[#FFFFFF] transition-colors hover:underline cursor-pointer"
          aria-label={t.language.toggleLanguage}
        >
          {language === "en" ? t.language.chinese : t.language.english}
        </button>
      </div>
    </header>
  );
}
