"use client";

import EnterButton from "@/components/CoolButton";
import Link from "next/link";
import Header from "@/components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function About() {
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // ✅ NEW: Preload ball.png image for instant display when menu opens
  useEffect(() => {
    const img = new window.Image();
    img.src = "/ball.png";

    // Load contract address
    import("../../../constants/contract-address.json").then((data) => {
      setContractAddress(data.Cookie);
    });
  }, []);

  // ✅ NEW: Handle copy address functionality for footer
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
    <div className="min-h-screen bg-[#fff49b] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
      {/* Header: desktop offset preserved, no desktop shift */}
      <div className="pt-[env(safe-area-inset-top)] py-6 md:pt-0 md:-mt-4">
        <Header
          currentPage="how-it-works"
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>

      {/* Mobile Layout: Show menu overlay or main content */}
      <div className="md:hidden">
        {isMenuOpen ? (
          <div className="relative w-full min-h-[100dvh] overflow-hidden px-8 pt-2 pb-[68px]">
            <div className="flex items-end justify-center min-h-[80dvh]">
              <img
                src="/ball.png"
                alt="Ball"
                className="w-auto h-auto max-w-[50%] max-h-[50%] object-contain"
              />
            </div>

            {/* Mobile Footer for Menu Overlay */}
            <footer className="fixed bottom-0 left-0 right-0 bg-[#fff49b] z-50 font-['Fira_Code'] text-[#666666] h-[72px] overflow-hidden">
              <div className="fixed bottom-0 left-0 right-0 z-0 flex flex-col items-center py-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
                <div className="text-xs text-[#666666] font-mono text-center">
                  ERC-404 POWERED LOTTERY ON BSC
                </div>
                <div
                  className="text-xs text-[#666666] font-mono text-center opacity-75 cursor-pointer hover:text-[#212427] transition-colors"
                  onClick={handleCopyAddress}
                >
                  {copied ? "Copied Successfully!" : contractAddress || ""}
                </div>
                <div className="flex items-center space-x-1 text-[#666666] font-thin hover:text-[#212427] transition-colors group">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:[&>path]:fill-[#212427] transition-colors"
                  >
                    <path
                      d="M10 9C10 8.44754 10.4476 8 10.9997 8H13C13.5071 8 13.7898 8.16249 13.9378 8.28087C14.0486 8.36952 14.1077 8.45538 14.119 8.4731C14.3737 8.94812 14.962 9.13706 15.4472 8.89443C15.9309 8.65259 16.1361 8.03372 15.8934 7.55064C15.8387 7.44229 15.7712 7.34071 15.6984 7.24375C15.5859 7.09376 15.4194 6.90487 15.1872 6.71913C14.7102 6.33751 13.9929 6 13 6H10.9997C9.34271 6 8 7.34332 8 9V14.9999C8 16.6566 9.34275 17.9999 10.9998 17.9999L13 17.9999C13.9929 18 14.7101 17.6625 15.1872 17.2809C15.4194 17.0951 15.5859 16.9062 15.6984 16.7563C15.7714 16.659 15.8389 16.5568 15.8939 16.4483C16.138 15.9605 15.9354 15.3497 15.4472 15.1056C14.962 14.8629 14.3737 15.0519 14.119 15.5269C14.1077 15.5446 14.0486 15.6305 13.9378 15.7191C13.7899 15.8375 13.5071 16 13 15.9999L10.9998 15.9999C10.4476 15.9999 10 15.5524 10 14.9999V9Z"
                      fill="#666666"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
                      fill="#666666"
                    />
                  </svg>
                  <span className="text-xs">CookieBNB.xyz 2025</span>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <main className="max-w-4xl py-24 mx-auto px-0">
            <div className="text-center mb-0">
              <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
                About Cookie
              </h1>
              <p className="text-lg px-8 text-[#666666] font-thin">
                A custom ERC-404 lottery project on BSC
              </p>
            </div>

            {/* Ball Image */}
            <div className="flex justify-center mb-8 mt-8">
              <Image
                src="/ball.png"
                alt="Cookie"
                width={140}
                height={140}
                className="object-contain"
              />
            </div>

            <div className="space-y-0">
              {/* Project Overview */}
              <div className="rounded-xs">
                <section className="p-8">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                    Project Overview
                  </h2>
                  <p className="text-[#666666] font-thin leading-relaxed">
                    CookieBNB.xyz is a decentralized lottery system on the BSC
                    network using a custom ERC-404 contract. Automated.
                    Immutable. Always fair. Every draw combines marketing
                    virality and tokenomics buybacks into a dual flywheel that
                    compounds growth.
                  </p>
                </section>
              </div>

              {/* How It Works */}
              <div className="rounded-xs">
                <section className="w-full mx-auto p-6 sm:p-8 pt-0 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                    How to Enter
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    {/* 1 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        1
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Acquire Your Cookie
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Buy at least 1 $Cookie token. Each token = 1 NFT and 1
                          lottery entry.
                        </p>
                      </div>
                    </div>

                    {/* 2 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        2
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Post on X
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Post your NFT on X tagging @CookieBinance. Use our
                          default template. All tokens in your wallet are
                          auto-entered.
                        </p>
                      </div>
                    </div>

                    {/* 3 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        3
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Automatic Entries
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Our backend tracks posts and wallets. New tokens are
                          added automatically. Tokens you transfer out are
                          removed. Delete your post and all entries pause until
                          you post again.
                        </p>
                      </div>
                    </div>

                    {/* 4 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        4
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Automated Drawings
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Smart contracts instantly reward winners at the end of
                          each draw.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Why it works*/}
              <div className="rounded-xs">
                <section className="p-6 sm:p-8">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                    Why It Works
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    {/* 1 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        1
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Built-In Virality
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Posting on X makes every player a promoter, fueling
                          organic exposure.
                        </p>
                      </div>
                    </div>

                    {/* 2 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        2
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          The Marketing Flywheel
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Posts → visibility → participation → liquidity →
                          bigger prize pools. The cycle runs itself.
                        </p>
                      </div>
                    </div>

                    {/* 3 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        3
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          The Token Flywheel
                        </h3>
                        <div className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          <p className="mb-2">
                            Each trade powers growth. With every transaction:
                          </p>
                          <p className="mb-1">
                            1% fuels automated buybacks (supply sinks, value
                            rises).
                          </p>
                          <p className="mb-1">3% grows the prize pool.</p>
                          <p>1% supports the team.</p>
                        </div>
                      </div>
                    </div>

                    {/* 4 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        4
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          Compounding Value
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          Each post drives attention. Each trade boosts
                          liquidity. Each winner proves fairness. Together, the
                          flywheels create unstoppable momentum.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Technology */}
              <div className="rounded-xs">
                <section className="p-8">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                    Technology
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        ERC-404 Tax Standard
                      </h3>
                      <p className="text-[#666666] font-thin">
                        The first-ever custom ERC-404 Tax contract. Tokenomics
                        are built directly into the token&apos;s core
                        logic—buybacks, prize pools, and accounting happen at
                        the protocol level, not bolted on.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        Lottery Contract
                      </h3>
                      <p className="text-[#666666] font-thin">
                        Fully automated draw lifecycle. Rounds, entries,
                        randomness, and payouts are handled on-chain with a
                        complete audit trail.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        Chainlink VRF
                      </h3>
                      <p className="text-[#666666] font-thin">
                        Cryptographically verifiable randomness ensures every
                        draw is transparent, unpredictable, and tamper-proof.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        BSC Network
                      </h3>
                      <p className="text-[#666666] font-thin">
                        Deployed on BSC for low fees, fast finality, and
                        security.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        Smart Contracts
                      </h3>
                      <p className="text-[#666666] font-thin">
                        Audited, deterministic, and designed for continuous
                        automation without manual intervention.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Tokenomics */}
              <div className="rounded-xs">
                <section className="p-8">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                    Tokenomics
                  </h2>
                  <p className="text-[#666666] font-thin leading-relaxed mb-4">
                    Cookie uses a 5% tax model integrated at the contract level.
                    This ensures that every transaction fuels the ecosystem:
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-[#666666] font-thin">
                      <strong>1% Buybacks</strong> — Automated buybacks reduce
                      supply and strengthen price momentum.
                    </p>
                    <p className="text-[#666666] font-thin">
                      <strong>3% Prize Pool</strong> — Directly expands lottery
                      rewards, making each draw bigger and more attractive.
                    </p>
                    <p className="text-[#666666] font-thin">
                      <strong>1% Team</strong> — Supports long-term development
                      and ecosystem growth.
                    </p>
                  </div>
                  <p className="text-[#666666] font-thin leading-relaxed">
                    This design creates a natural flywheel: volume drives prize
                    pools, buybacks support token value, and posts generate
                    visibility. Every player powers the system just by
                    participating.
                  </p>
                </section>
              </div>

              {/* Back to Home */}
              <div className="pt-4 flex justify-center">
                <Link href="/">
                  <EnterButton
                    onClick={() => console.log("Play button clicked")}
                  >
                    Back to Home
                  </EnterButton>
                </Link>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Desktop Layout (unchanged) */}
      <main className="hidden md:block max-w-4xl py-12 mx-auto px-0">
        <div className="text-center mb-0">
          <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
            About Cookie
          </h1>
          <p className="text-lg px-8 text-[#666666] font-thin">
            A custom ERC-404 lottery project on BSC
          </p>
        </div>

        {/* Ball Image */}
        <div className="flex justify-center mb-8 mt-8">
          <Image
            src="/ball.png"
            alt="Cookie"
            width={140}
            height={140}
            className="object-contain"
          />
        </div>

        <div className="space-y-0">
          {/* Project Overview */}
          <div className="rounded-xs">
            <section className="p-8">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                Project Overview
              </h2>
              <p className="text-[#666666] font-thin leading-relaxed">
                CookieBNB.xyz is a decentralized lottery system on the BSC
                network using a custom ERC-404 contract. Automated. Immutable.
                Always fair. Every draw combines marketing virality and
                tokenomics buybacks into a dual flywheel that compounds growth.
              </p>
            </section>
          </div>

          {/* How It Works */}
          <div className="rounded-xs">
            <section className="w-full mx-auto p-6 sm:p-8 pt-0 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                How to Enter
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* 1 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Acquire Your Cookie
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Buy at least 1 $Cookie token. Each token = 1 NFT and 1
                      lottery entry.
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Post on X
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Post your NFT on X tagging @CookieBinance. Use our default
                      template. All tokens in your wallet are auto-entered.
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Automatic Entries
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Our backend tracks posts and wallets. New tokens are added
                      automatically. Tokens you transfer out are removed. Delete
                      your post and all entries pause until you post again.
                    </p>
                  </div>
                </div>

                {/* 4 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Automated Drawings
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Smart contracts instantly reward winners at the end of
                      each draw.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Why it works*/}
          <div className="rounded-xs">
            <section className="p-6 sm:p-8">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                Why It Works
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* 1 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Built-In Virality
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Posting on X makes every player a promoter, fueling
                      organic exposure.
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      The Marketing Flywheel
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Posts → visibility → participation → liquidity → bigger
                      prize pools. The cycle runs itself.
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      The Token Flywheel
                    </h3>
                    <div className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      <p className="mb-2">
                        Each trade powers growth. With every transaction:
                      </p>
                      <p className="mb-1">
                        1% fuels automated buybacks (supply sinks, value rises).
                      </p>
                      <p className="mb-1">3% grows the prize pool.</p>
                      <p>1% supports the team.</p>
                    </div>
                  </div>
                </div>

                {/* 4 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      Compounding Value
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      Each post drives attention. Each trade boosts liquidity.
                      Each winner proves fairness. Together, the flywheels
                      create unstoppable momentum.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Technology */}
          <div className="rounded-xs">
            <section className="p-8">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                Technology
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    ERC-404 Tax Standard
                  </h3>
                  <p className="text-[#666666] font-thin">
                    The first-ever custom ERC-404 Tax contract. Tokenomics are
                    built directly into the token&apos;s core logic—buybacks,
                    prize pools, and accounting happen at the protocol level,
                    not bolted on.
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    Lottery Contract
                  </h3>
                  <p className="text-[#666666] font-thin">
                    Fully automated draw lifecycle. Rounds, entries, randomness,
                    and payouts are handled on-chain with a complete audit
                    trail.
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    Chainlink VRF
                  </h3>
                  <p className="text-[#666666] font-thin">
                    Cryptographically verifiable randomness ensures every draw
                    is transparent, unpredictable, and tamper-proof.
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    BSC Network
                  </h3>
                  <p className="text-[#666666] font-thin">
                    Deployed on BSC for low fees, fast finality, and security.
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    Smart Contracts
                  </h3>
                  <p className="text-[#666666] font-thin">
                    Audited, deterministic, and designed for continuous
                    automation without manual intervention.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Tokenomics */}
          <div className="rounded-xs">
            <section className="p-8">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                Tokenomics
              </h2>
              <p className="text-[#666666] font-thin leading-relaxed mb-4">
                Cookie uses a 5% tax model integrated at the contract level.
                This ensures that every transaction fuels the ecosystem:
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-[#666666] font-thin">
                  <strong>1% Buybacks</strong> — Automated buybacks reduce
                  supply and strengthen price momentum.
                </p>
                <p className="text-[#666666] font-thin">
                  <strong>3% Prize Pool</strong> — Directly expands lottery
                  rewards, making each draw bigger and more attractive.
                </p>
                <p className="text-[#666666] font-thin">
                  <strong>1% Team</strong> — Supports long-term development and
                  ecosystem growth.
                </p>
              </div>
              <p className="text-[#666666] font-thin leading-relaxed">
                This design creates a natural flywheel: volume drives prize
                pools, buybacks support token value, and posts generate
                visibility. Every player powers the system just by
                participating.
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="pt-4 flex justify-center">
            <Link href="/">
              <EnterButton onClick={() => console.log("Play button clicked")}>
                Back to Home
              </EnterButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
