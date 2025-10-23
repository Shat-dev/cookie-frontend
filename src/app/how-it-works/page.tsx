"use client";

import EnterButton from "@/components/CoolButton";
import Link from "next/link";
import Header from "@/components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function HowItWorks() {
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const { t } = useLanguage();

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
                  {t.footer.erc404PoweredLottery}
                </div>
                <div
                  className="text-xs text-[#666666] font-mono text-center opacity-75 cursor-pointer hover:text-[#212427] transition-colors"
                  onClick={handleCopyAddress}
                >
                  {copied ? t.common.copiedSuccessfully : contractAddress || ""}
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
                  <span className="text-xs">{t.footer.copyright}</span>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <main className="max-w-4xl py-24 mx-auto px-0">
            <div className="text-center mb-0">
              <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
                {t.howItWorks.title}
              </h1>
              <p className="text-lg px-8 text-[#666666] font-thin">
                {t.howItWorks.subtitle}
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
                    {t.howItWorks.projectOverview.title}
                  </h2>
                  <p className="text-[#666666] font-thin leading-relaxed">
                    {t.howItWorks.projectOverview.description}
                  </p>
                </section>
              </div>

              {/* How It Works */}
              <div className="rounded-xs">
                <section className="w-full mx-auto p-6 sm:p-8 pt-0 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                    {t.howItWorks.howToEnter.title}
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    {/* 1 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        1
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          {t.howItWorks.howToEnter.steps.acquireCookie.title}
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.howToEnter.steps.acquireCookie
                              .description
                          }
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
                          {t.howItWorks.howToEnter.steps.postOnX.title}
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {t.howItWorks.howToEnter.steps.postOnX.description}
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
                          {t.howItWorks.howToEnter.steps.automaticEntries.title}
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.howToEnter.steps.automaticEntries
                              .description
                          }
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
                          {
                            t.howItWorks.howToEnter.steps.automatedDrawings
                              .title
                          }
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.howToEnter.steps.automatedDrawings
                              .description
                          }
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
                    {t.howItWorks.whyItWorks.title}
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    {/* 1 */}
                    <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                        1
                      </div>
                      <div>
                        <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                          {t.howItWorks.whyItWorks.points.builtInVirality.title}
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.whyItWorks.points.builtInVirality
                              .description
                          }
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
                          {
                            t.howItWorks.whyItWorks.points.marketingFlywheel
                              .title
                          }
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.whyItWorks.points.marketingFlywheel
                              .description
                          }
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
                          {t.howItWorks.whyItWorks.points.tokenFlywheel.title}
                        </h3>
                        <div className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          <p className="mb-2">
                            {
                              t.howItWorks.whyItWorks.points.tokenFlywheel
                                .details.intro
                            }
                          </p>
                          <p className="mb-1">
                            {
                              t.howItWorks.whyItWorks.points.tokenFlywheel
                                .details.buybacks
                            }
                          </p>
                          <p className="mb-1">
                            {
                              t.howItWorks.whyItWorks.points.tokenFlywheel
                                .details.prizePool
                            }
                          </p>
                          <p>
                            {
                              t.howItWorks.whyItWorks.points.tokenFlywheel
                                .details.team
                            }
                          </p>
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
                          {
                            t.howItWorks.whyItWorks.points.compoundingValue
                              .title
                          }
                        </h3>
                        <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                          {
                            t.howItWorks.whyItWorks.points.compoundingValue
                              .description
                          }
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
                    {t.howItWorks.technology.title}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        {t.howItWorks.technology.items.erc404Tax.title}
                      </h3>
                      <p className="text-[#666666] font-thin">
                        {t.howItWorks.technology.items.erc404Tax.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        {t.howItWorks.technology.items.lotteryContract.title}
                      </h3>
                      <p className="text-[#666666] font-thin">
                        {
                          t.howItWorks.technology.items.lotteryContract
                            .description
                        }
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        {t.howItWorks.technology.items.chainlinkVrf.title}
                      </h3>
                      <p className="text-[#666666] font-thin">
                        {t.howItWorks.technology.items.chainlinkVrf.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        {t.howItWorks.technology.items.bscNetwork.title}
                      </h3>
                      <p className="text-[#666666] font-thin">
                        {t.howItWorks.technology.items.bscNetwork.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semi-bold text-[#212427] mb-2">
                        {t.howItWorks.technology.items.smartContracts.title}
                      </h3>
                      <p className="text-[#666666] font-thin">
                        {
                          t.howItWorks.technology.items.smartContracts
                            .description
                        }
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Tokenomics */}
              <div className="rounded-xs">
                <section className="p-8">
                  <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                    {t.howItWorks.tokenomics.title}
                  </h2>
                  <p className="text-[#666666] font-thin leading-relaxed mb-4">
                    {t.howItWorks.tokenomics.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-[#666666] font-thin">
                      {t.howItWorks.tokenomics.breakdown.buybacks}
                    </p>
                    <p className="text-[#666666] font-thin">
                      {t.howItWorks.tokenomics.breakdown.prizePool}
                    </p>
                    <p className="text-[#666666] font-thin">
                      {t.howItWorks.tokenomics.breakdown.team}
                    </p>
                  </div>
                  <p className="text-[#666666] font-thin leading-relaxed">
                    {t.howItWorks.tokenomics.conclusion}
                  </p>
                </section>
              </div>

              {/* Back to Home */}
              <div className="pt-4 flex justify-center">
                <Link href="/">
                  <EnterButton
                    onClick={() => console.log("Play button clicked")}
                  >
                    {t.common.backToHome}
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
            {t.howItWorks.title}
          </h1>
          <p className="text-lg px-8 text-[#666666] font-thin">
            {t.howItWorks.subtitle}
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
                {t.howItWorks.projectOverview.title}
              </h2>
              <p className="text-[#666666] font-thin leading-relaxed">
                {t.howItWorks.projectOverview.description}
              </p>
            </section>
          </div>

          {/* How It Works */}
          <div className="rounded-xs">
            <section className="w-full mx-auto p-6 sm:p-8 pt-0 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-3 sm:mb-4">
                {t.howItWorks.howToEnter.title}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* 1 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      {t.howItWorks.howToEnter.steps.acquireCookie.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {t.howItWorks.howToEnter.steps.acquireCookie.description}
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
                      {t.howItWorks.howToEnter.steps.postOnX.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {t.howItWorks.howToEnter.steps.postOnX.description}
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
                      {t.howItWorks.howToEnter.steps.automaticEntries.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {
                        t.howItWorks.howToEnter.steps.automaticEntries
                          .description
                      }
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
                      {t.howItWorks.howToEnter.steps.automatedDrawings.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {
                        t.howItWorks.howToEnter.steps.automatedDrawings
                          .description
                      }
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
                {t.howItWorks.whyItWorks.title}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* 1 */}
                <div className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#212427] flex items-center justify-center text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semi-bold text-[#212427] mb-1.5 sm:mb-2">
                      {t.howItWorks.whyItWorks.points.builtInVirality.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {
                        t.howItWorks.whyItWorks.points.builtInVirality
                          .description
                      }
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
                      {t.howItWorks.whyItWorks.points.marketingFlywheel.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {
                        t.howItWorks.whyItWorks.points.marketingFlywheel
                          .description
                      }
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
                      {t.howItWorks.whyItWorks.points.tokenFlywheel.title}
                    </h3>
                    <div className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      <p className="mb-2">
                        {
                          t.howItWorks.whyItWorks.points.tokenFlywheel.details
                            .intro
                        }
                      </p>
                      <p className="mb-1">
                        {
                          t.howItWorks.whyItWorks.points.tokenFlywheel.details
                            .buybacks
                        }
                      </p>
                      <p className="mb-1">
                        {
                          t.howItWorks.whyItWorks.points.tokenFlywheel.details
                            .prizePool
                        }
                      </p>
                      <p>
                        {
                          t.howItWorks.whyItWorks.points.tokenFlywheel.details
                            .team
                        }
                      </p>
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
                      {t.howItWorks.whyItWorks.points.compoundingValue.title}
                    </h3>
                    <p className="text-[#666666] font-thin leading-snug sm:leading-normal">
                      {
                        t.howItWorks.whyItWorks.points.compoundingValue
                          .description
                      }
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
                {t.howItWorks.technology.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    {t.howItWorks.technology.items.erc404Tax.title}
                  </h3>
                  <p className="text-[#666666] font-thin">
                    {t.howItWorks.technology.items.erc404Tax.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    {t.howItWorks.technology.items.lotteryContract.title}
                  </h3>
                  <p className="text-[#666666] font-thin">
                    {t.howItWorks.technology.items.lotteryContract.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    {t.howItWorks.technology.items.chainlinkVrf.title}
                  </h3>
                  <p className="text-[#666666] font-thin">
                    {t.howItWorks.technology.items.chainlinkVrf.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    {t.howItWorks.technology.items.bscNetwork.title}
                  </h3>
                  <p className="text-[#666666] font-thin">
                    {t.howItWorks.technology.items.bscNetwork.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semi-bold text-[#212427] mb-2">
                    {t.howItWorks.technology.items.smartContracts.title}
                  </h3>
                  <p className="text-[#666666] font-thin">
                    {t.howItWorks.technology.items.smartContracts.description}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Tokenomics */}
          <div className="rounded-xs">
            <section className="p-8">
              <h2 className="text-xl font-semi-bold text-[#212427] mb-4">
                {t.howItWorks.tokenomics.title}
              </h2>
              <p className="text-[#666666] font-thin leading-relaxed mb-4">
                {t.howItWorks.tokenomics.description}
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-[#666666] font-thin">
                  {t.howItWorks.tokenomics.breakdown.buybacks}
                </p>
                <p className="text-[#666666] font-thin">
                  {t.howItWorks.tokenomics.breakdown.prizePool}
                </p>
                <p className="text-[#666666] font-thin">
                  {t.howItWorks.tokenomics.breakdown.team}
                </p>
              </div>
              <p className="text-[#666666] font-thin leading-relaxed">
                {t.howItWorks.tokenomics.conclusion}
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="pt-4 flex justify-center">
            <Link href="/">
              <EnterButton onClick={() => console.log("Play button clicked")}>
                {t.common.backToHome}
              </EnterButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
