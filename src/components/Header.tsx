"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
    <header className="fixed top-0 inset-x-0 z-[100] bg-[#fff49b] h-[80px] pt-[80px] px-4 md:relative md:px-8 py-3 md:py-6  md:h-auto">
      {/* Desktop Top Left */}
      <div className="hidden md:block absolute left-2 md:left-4 top-6 text-lg md:text-lg text-base font-thin">
        <div className="text-[#666666] mb-1 hover:text-[#212427] transition-colors text-xs md:text-lg">
          <span className="hidden md:inline">ERC-404 Powered Lottery</span>
        </div>
        <div
          className="text-[#666666] font-thin hover:text-[#212427] transition-colors cursor-pointer text-xs md:text-base font-mono"
          onClick={handleCopyAddress}
        >
          {/* Desktop: 2 lines */}
          <div className="hidden md:flex flex-col">
            <div className="transition-all duration-300 ease-in-out flex items-center gap-1">
              {copied ? (
                <>Copied Successfully!</>
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
            src="/title_mobile.png"
            alt="Playcookie.xyz"
            width={105}
            height={30}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Desktop Center - Title */}
      <div className="hidden md:block text-center">
        <Link href="/" className="block">
          <Image
            src="/title (1).png"
            alt="Playcookie.xyz"
            width={100}
            height={30}
            className="mx-auto hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden absolute right-1 top-4 mobile-menu-container">
        <Image
          src={menuOpen ? "/cross.svg" : "/hamburger-menu.svg"}
          alt={menuOpen ? "Close menu" : "Menu"}
          width={45}
          height={45}
          className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:bg-gray-100 rounded-md p-1"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Toggle menu"}
        />

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute text-right text-[#666666] font-thin z-50 transform transition-all duration-200 ease-in-out min-w-[120px] space-y-2.5 right-3 top-16">
            <Link
              href="https://x.com/PlayCookieXYZ"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#666666] hover:text-[#212427] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              Twitter
            </Link>
            <Link
              href={`https://basescan.org/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#666666] hover:text-[#212427] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              Contract
            </Link>

            <Link
              href={`https://dexscreener.com/base/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#666666] hover:text-[#212427] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              Dexscreener
            </Link>
            <Link
              href="/how-it-works"
              className="block hover:text-[#212427] hover:underline transition-colors text-base text-[#666666]"
            >
              How it works
            </Link>
            <Link
              href="https://playcookie.gitbook.io/play-cookie/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#666666] hover:text-[#212427] hover:underline transition-colors text-base"
              onClick={closeMenu}
            >
              Docs
            </Link>

            <Link
              href="/faq"
              className="block text-[#666666] font-thin hover:text-[#212427] hover:underline transition-colors text-base"
            >
              FAQ
            </Link>
          </div>
        )}
      </div>
      {/* Desktop Top Right Navigation */}
      <div className="hidden md:block absolute right-2 md:right-4 top-6 text-base md:text-lg space-y-0.25 md:space-y-1 text-right text-[#666666] font-thin">
        <Link
          href="https://x.com/PlayCookieXYZ"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#212427] hover:underline transition-colors text-xs md:text-base"
        >
          Twitter
        </Link>
        <Link
          href={`https://basescan.org/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#212427] hover:underline transition-colors text-xs md:text-base"
        >
          Contract
        </Link>
        <Link
          href={`https://dexscreener.com/base/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#212427] hover:underline transition-colors text-xs md:text-base"
        >
          Dexscreener
        </Link>
        <Link
          href="/how-it-works"
          className={`block hover:text-[#212427] hover:underline transition-colors text-xs md:text-base ${
            page === "how-it-works" ? "" : ""
          }`}
        >
          How it works
        </Link>
        <Link
          href="https://playcookie.gitbook.io/play-cookie/"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#212427] hover:underline transition-colors text-xs md:text-base"
        >
          Docs
        </Link>
        <Link
          href="/faq"
          className="text-xs md:text-lg text-[#666666] font-thin hover:text-[#212427] transition-colors hover:underline"
        >
          FAQ
        </Link>
      </div>
    </header>
  );
}
