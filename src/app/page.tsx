"use client";

import Link from "next/link";
import { useEffect, useState, useLayoutEffect, memo, useMemo } from "react";
import EnterButton from "@/components/CoolButton";
import Header from "@/components/Header";
import Gumball from "@/components/Gumball";
import CountdownTimer from "@/components/CountdownTimer";
import { useProjections } from "@/hooks/useProjections";
import { usePoolCount } from "@/hooks/usePoolCount";
import { useWinners } from "@/hooks/useWinners";
import { usePrizePool } from "@/hooks/usePrizePool";
import { useCurrentDraw } from "@/hooks/useCurrentDraw";
import { getApiEndpoint } from "@/utils/api";

// Memoized mobile gumball section to prevent re-renders from state changes
const MobileGumballSection = memo(() => (
  <>
    {/* Gumball hero with your ORIGINAL fade */}
    <div className="relative flex items-start justify-center -mt-[12%]">
      <Gumball />
      <div className="absolute bottom-0 left-0 right-0 h-10/20 [@media(min-width:900px)]:h-9/20 bg-[linear-gradient(to_top,rgba(242,242,242,1)_0%,rgba(242,242,242,1)_75%,rgba(242,242,242,0)_100%)] pointer-events-none" />
    </div>
  </>
));

MobileGumballSection.displayName = "MobileGumballSection";

export default function Home() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use the same hooks as current-pool page
  const { totalCount: projectionCount, loading: projectionsLoading } =
    useProjections();
  const { count: poolCount } = usePoolCount();
  const { winners } = useWinners();
  const {
    formattedUsd: prizePoolUsd,
    loading: prizePoolLoading,
    error: prizePoolError,
  } = usePrizePool();
  const { automation, loading: drawLoading } = useCurrentDraw();

  // ✅ NEW: Enhanced display count logic using same priority system as current-pool page
  // Use projection count as primary, with automation data as secondary source
  const displayCount = useMemo(() => {
    // Priority 1: Real-time projection count (when available)
    if (projectionCount > 0) return projectionCount;

    // Priority 2: Automation data entry count (more accurate than pool count)
    if (automation?.totalEntries && automation.totalEntries > 0)
      return automation.totalEntries;

    // Priority 3: Pool count (fallback)
    if (poolCount > 0) return poolCount;

    // Priority 4: Default
    return 0;
  }, [projectionCount, automation?.totalEntries, poolCount]);

  const isCountLoading =
    projectionsLoading && projectionCount === 0 && drawLoading;

  useEffect(() => {
    // Import the contract address from the constants file
    import("../../constants/contract-address.json").then((data) => {
      setContractAddress(data.Gacha);
    });

    // Preload ball.png image for instant display when menu opens
    const ballImg = new window.Image();
    ballImg.src = "/ball.png";

    // Preload gacha.png image for instant display of Gumball component
    const gumballImg = new window.Image();
    gumballImg.src = "/gacha.png";
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
    <div className="min-h-screen bg-[#F2F2F2] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
      {/* Header: desktop offset preserved, no desktop shift */}
      <div className="pt-[env(safe-area-inset-top)] py-10 md:pt-0 md:-mt-4">
        <Header
          currentPage="home"
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>

      {/* Desktop Layout (unchanged) */}
      <main className="hidden md:flex items-center justify-center min-h-[60vh] px-8 pt-10">
        <div className="flex items-center gap-0 mr-20">
          <div className="flex-shrink-0">
            <Gumball />
          </div>
          <div className="flex flex-col space-y-8 ">
            <div>
              <div className="text-xs text-[#666666] uppercase tracking-wider mb-1">
                Prize Pool
              </div>
              <div className="text-5xl font-mono text-[#212427]">
                {prizePoolLoading ? (
                  <div className="flex items-center">
                    <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mr-4" />
                    <span className="text-[#666666]">Loading...</span>
                  </div>
                ) : prizePoolError ? (
                  <span className="text-[#212427]">$2,000</span>
                ) : (
                  prizePoolUsd
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#666666] uppercase tracking-wider mb-1">
                Time Left
              </div>
              <div className="text-4xl font-mono text-[#212427]">
                <CountdownTimer />
              </div>
            </div>

            <div>
              <div className="text-xs text-[#666666] uppercase tracking-wider mb-1">
                Current Entries
              </div>
              <div className="text-3xl font-mono text-[#212427]">
                {isCountLoading ? (
                  <div className="h-6 w-6 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                ) : (
                  displayCount
                )}
              </div>
            </div>

            <div className="pt-4 flex -ml-0 space-x-2 ">
              <Link href="/current-pool">
                <EnterButton onClick={() => console.log("Play button clicked")}>
                  Current pool
                </EnterButton>
              </Link>
              <Link href="/enter">
                <EnterButton onClick={() => console.log("Play button clicked")}>
                  Enter Gacha
                </EnterButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Layout: centered Gumball, existing fade kept, stats overlaid */}
      <div className="md:hidden relative w-full min-h-[100dvh] overflow-hidden px-8 pt-2 pb-[68px]">
        {isMenuOpen ? (
          <div className="flex items-end justify-center min-h-[80dvh]">
            <img
              src="/ball.png"
              alt="Ball"
              className="w-auto h-auto max-w-[50%] max-h-[50%] object-contain"
            />
          </div>
        ) : (
          <>
            <MobileGumballSection />

            {/* Stats + buttons layered ON TOP of the faded area */}
            <div
              className="absolute inset-x-0 z-20 text-center space-y-0"
              style={{ bottom: "15%" }} /* adjust 18–28% to taste */
            >
              {/* Prize Pool */}
              <div>
                <div className="uppercase tracking-wider text-[#666666] mb-1 text-[clamp(10px,3.2vw,12px)]">
                  Prize Pool
                </div>
                <div className="font-mono text-[#212427] text-[clamp(18px,6vw,24px)]">
                  {prizePoolLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mr-2" />
                      <span className="text-[#666666]">Loading...</span>
                    </div>
                  ) : prizePoolError ? (
                    <span className="text-[#212427]">$2,000</span>
                  ) : (
                    prizePoolUsd
                  )}
                </div>
              </div>

              {/* Time Left */}
              <div>
                <div className="uppercase tracking-wider text-[#666666] mb-1 text-[clamp(10px,3.2vw,12px)]">
                  Time Left
                </div>
                <div className="font-mono text-[#212427] text-[clamp(16px,5.2vw,20px)]">
                  <CountdownTimer />
                </div>
              </div>

              {/* Current Entries */}
              <div>
                <div className="uppercase tracking-wider text-[#666666] mb-1 text-[clamp(10px,3.2vw,12px)]">
                  Current Entries
                </div>
                <div className="font-mono text-[#212427] text-[clamp(14px,4.8vw,18px)] break-words">
                  {isCountLoading ? (
                    <div className="h-3 w-3 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                  ) : (
                    displayCount
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-center gap-2">
                <Link href="/current-pool">
                  <EnterButton
                    onClick={() => console.log("Play button clicked")}
                  >
                    Current pool
                  </EnterButton>
                </Link>
                <Link href="/enter">
                  <EnterButton
                    onClick={() => console.log("Play button clicked")}
                  >
                    Enter Gacha
                  </EnterButton>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer (desktop unchanged, mobile reserves space via pb on container) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#f2f2f2] z-50 font-['Fira_Code'] text-[#666666] h-[72px] md:h-auto overflow-hidden">
        {winners.length === 0 ? (
          <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-60 flex flex-col items-center py-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
              <div className="text-xs text-[#666666] font-mono text-center">
                ERC-404 POWERED GACHA LOTTERY ON BASE
              </div>
              <div
                className="text-xs text-[#666666] font-mono text-center opacity-75 cursor-pointer hover:text-[#212427] transition-colors"
                onClick={handleCopyAddress}
              >
                {copied
                  ? "Copied Successfully!"
                  : contractAddress ||
                    "0x6B60298f5Ab2D4B133D4385a73B17e95B16AA2aD"}
              </div>
              <div className="flex items-center space-x-1 text-[#666666] font-thin hover:text-[#212427] transition-colors group">
                {/* svg kept */}
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
                <span className="text-xs">Playgacha.xyz 2025</span>
              </div>
            </div>

            {/* Desktop footer unchanged */}
            <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-0 justify-between items-center px-2 md:px-4 py-4">
              <Link href="/results">
                <div className="text-xs md:text-lg text-[#666666] font-thin hover:text-[#212427] transition-colors">
                  Latest winners
                </div>
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2 text-[#666666] font-thin hover:text-[#212427] transition-colors group">
                {/* svg kept */}
                <svg
                  width="16"
                  height="16"
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
                <span className="text-xs md:text-base">Playgacha.xyz 2025</span>
              </div>
            </div>
          </>
        ) : (
          <>{/* Desktop winners section removed per request */}</>
        )}
      </footer>
    </div>
  );
}
