"use client";

import Header from "@/components/Header";
import Link from "next/link";
import EnterButton from "@/components/CoolButton";
import GlassmorphismDiv from "@/components/GlassmorphismDiv";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

// Backend API endpoint for lottery results
const API_BASE_URL = getApiUrl();

// Cache configuration
const CACHE_KEY = "lottery-rounds-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

interface LotteryRound {
  roundNumber: number;
  winner: string;
  winningTokenId: string;
  totalEntries: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  requestId: string;
  payoutAmount?: string; // ETH amount
  payoutAmountUsd?: number; // USD amount
  snapshotTxHash?: string; // Snapshot transaction hash for BscScan link
  vrfTxHash?: string; // VRF requestRandomWinner transaction hash for BscScan link
}

interface CachedData {
  data: LotteryRound[];
  timestamp: number;
}

// Cache utility functions
const getCachedRounds = (): LotteryRound[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp }: CachedData = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log("📦 Using cached lottery data");
        return data;
      } else {
        console.log("🗑️ Cache expired, removing old data");
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (error) {
    console.log("❌ Error reading cache:", error);
    localStorage.removeItem(CACHE_KEY);
  }
  return null;
};

const setCachedRounds = (rounds: LotteryRound[]) => {
  try {
    const cacheData: CachedData = {
      data: rounds,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("💾 Cached lottery data for 5 minutes");
  } catch (error) {
    console.log("❌ Error setting cache:", error);
  }
};

// Loading Spinner Component - Mobile-responsive centering
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 relative">
      {/* Mobile: Position relative to viewport center */}
      <div className="md:hidden">
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center justify-center p-6 ">
            <div className="w-8 h-8 border-2 border-[#dddddd] border-t-[#FFFFFF] rounded-full animate-spin mb-4"></div>
            <div className="text-[#FFFFFF] text-sm font-extralight whitespace-nowrap">
              Loading lottery results...
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Normal table centering */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#dddddd] border-t-[#FFFFFF] rounded-full animate-spin mb-4"></div>
        <div className="text-[#FFFFFF] text-sm font-extralight">
          Loading lottery results...
        </div>
      </div>
    </div>
  );
}

export default function DrawResults() {
  const [rounds, setRounds] = useState<LotteryRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLastUpdated] = useState<Date>(new Date());
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const { t } = useLanguage();

  // Refs for managing effects and preventing double-fetches
  const initialLoadDone = useRef(false);
  const effectStarted = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetching = useRef(false);

  // ✅ NEW: Preload ball.png image for instant display when menu opens
  useEffect(() => {
    const img = new window.Image();
    img.src = "/ball.png";

    // Load contract address
    import("../../../constants/contract-address.json")
      .then((data) => {
        setContractAddress(data.Cookie);
      })
      .catch((error) => {
        console.error("Failed to load contract address:", error);
        setContractAddress(""); // Fallback
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

  useEffect(() => {
    if (effectStarted.current) return; // guard StrictMode double-invoke in dev
    effectStarted.current = true;

    // Check cache first
    const cachedData = getCachedRounds();
    if (cachedData && cachedData.length > 0) {
      setRounds(cachedData);
      setIsLoading(false);
      setError(null);
      initialLoadDone.current = true;
      console.log("✅ Loaded from cache, skipping initial fetch");
    }

    // Fetch fresh data (either as initial load or background refresh)
    fetchLotteryResults(!cachedData); // Only show loading if no cache

    // Set up interval for background updates
    intervalRef.current = setInterval(() => fetchLotteryResults(false), 30_000);

    // Optional: refresh when tab regains focus
    const onVis = () => {
      if (document.visibilityState === "visible" && initialLoadDone.current) {
        fetchLotteryResults(false); // Background refresh, don't show loading
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const fetchLotteryResults = async (showLoading: boolean = true) => {
    if (isFetching.current) return;
    isFetching.current = true;

    const isInitialLoad = !initialLoadDone.current;
    const startTime = performance.now();

    // Only show loading spinner for initial loads or when explicitly requested
    if (showLoading && isInitialLoad) {
      setIsLoading(true);
    }

    try {
      console.log("🔄 Fetching lottery results from backend...");

      const response = await fetch(`${API_BASE_URL}/api/lottery/results`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Backend API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Backend API returned unsuccessful response"
        );
      }

      // Map backend data to frontend format
      const allRounds: LotteryRound[] = data.data.map(
        (round: {
          roundNumber: number;
          winner: string;
          winningTokenId: string;
          totalEntries: string;
          isCompleted: boolean;
          payoutAmount?: string;
          payoutAmountUsd?: number;
          snapshotTxHash?: string;
          vrfTxHash?: string;
          createdAt?: string;
          updatedAt?: string;
        }) => ({
          roundNumber: round.roundNumber,
          winner: round.winner,
          winningTokenId: round.winningTokenId,
          totalEntries: round.totalEntries,
          startTime: round.createdAt || new Date().toISOString(),
          endTime: round.updatedAt || new Date().toISOString(),
          isCompleted: round.isCompleted,
          requestId: "0", // Not needed for display
          payoutAmount: round.payoutAmount,
          payoutAmountUsd: round.payoutAmountUsd,
          snapshotTxHash: round.snapshotTxHash,
          vrfTxHash: round.vrfTxHash,
        })
      );

      // Sort newest first (backend should already do this, but ensure it)
      allRounds.sort((a, b) => b.roundNumber - a.roundNumber);

      // Update state and cache
      setRounds(allRounds);
      setLastUpdated(new Date());
      setError(null);

      // Cache the results for future page loads
      if (allRounds.length > 0) {
        setCachedRounds(allRounds);
      }

      const totalTime = performance.now() - startTime;
      console.log(
        `✅ Backend fetch completed in ${totalTime.toFixed(0)}ms for ${
          allRounds.length
        } rounds`
      );
    } catch (err: unknown) {
      console.error("Error fetching lottery results:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch lottery results"
      );
    } finally {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        setIsLoading(false); // Only set loading to false after first fetch
      } else if (showLoading) {
        setIsLoading(false);
      }
      isFetching.current = false;
    }
  };

  const getExplorerUrl = (addr: string) =>
    `https://bscscan.com/address/${addr}`;

  // Generate BscScan transaction URL for snapshot verification
  const getBscScanTxUrl = (txHash: string) =>
    `https://bscscan.com/tx/${txHash}`;

  // Generate BSC transaction URL for VRF verification
  const getVrfUrl = (vrfTxHash: string) =>
    `https://bscscan.com/tx/${vrfTxHash}`;

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatPayoutAmount = (round: LotteryRound) => {
    // Display priority: USD amount > BNB amount > fallback message
    // Calculated as 60% of pre-VRF contract balance snapshot
    if (round.payoutAmountUsd && round.payoutAmountUsd > 0) {
      return `$${round.payoutAmountUsd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (round.payoutAmount && parseFloat(round.payoutAmount) > 0) {
      return `${parseFloat(round.payoutAmount).toFixed(4)} BNB`;
    } else {
      // For older rounds or rounds with missing payout data
      return "N/A";
    }
  };

  const formatSecondaryPayout = (round: LotteryRound) => {
    // Show BNB amount as secondary info when USD is primary
    if (
      round.payoutAmountUsd &&
      round.payoutAmount &&
      parseFloat(round.payoutAmount) > 0
    ) {
      return `${parseFloat(round.payoutAmount).toFixed(4)} BNB`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FF1F1F] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
      {/* Header: desktop offset preserved, no desktop shift */}
      <div className="pt-[env(safe-area-inset-top)] py-6 md:pt-0 md:-mt-4">
        <Header
          currentPage="results"
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
            <footer className="fixed bottom-0 left-0 right-0 bg-[#FF1F1F] z-50 font-['Fira_Code'] text-[#FFFFFF] h-[72px] overflow-hidden">
              <div className="fixed bottom-0 left-0 right-0 z-0 flex flex-col items-center py-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
                <div className="text-xs text-[#FFFFFF] font-mono text-center">
                  {t.footer.erc404PoweredLottery}
                </div>
                <div
                  className="text-xs text-[#FFFFFF] font-mono text-center opacity-75 cursor-pointer hover:text-[#FFFFFF] transition-colors"
                  onClick={handleCopyAddress}
                >
                  {copied ? t.common.copiedSuccessfully : contractAddress || ""}
                </div>
                <div className="flex items-center space-x-1 text-[#FFFFFF] font-extralight hover:text-[#FFFFFF] transition-colors group">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:[&>path]:fill-[#FFFFFF] transition-colors"
                  >
                    <path
                      d="M10 9C10 8.44754 10.4476 8 10.9997 8H13C13.5071 8 13.7898 8.16249 13.9378 8.28087C14.0486 8.36952 14.1077 8.45538 14.119 8.4731C14.3737 8.94812 14.962 9.13706 15.4472 8.89443C15.9309 8.65259 16.1361 8.03372 15.8934 7.55064C15.8387 7.44229 15.7712 7.34071 15.6984 7.24375C15.5859 7.09376 15.4194 6.90487 15.1872 6.71913C14.7102 6.33751 13.9929 6 13 6H10.9997C9.34271 6 8 7.34332 8 9V14.9999C8 16.6566 9.34275 17.9999 10.9998 17.9999L13 17.9999C13.9929 18 14.7101 17.6625 15.1872 17.2809C15.4194 17.0951 15.5859 16.9062 15.6984 16.7563C15.7714 16.659 15.8389 16.5568 15.8939 16.4483C16.138 15.9605 15.9354 15.3497 15.4472 15.1056C14.962 14.8629 14.3737 15.0519 14.119 15.5269C14.1077 15.5446 14.0486 15.6305 13.9378 15.7191C13.7899 15.8375 13.5071 16 13 15.9999L10.9998 15.9999C10.4476 15.9999 10 15.5524 10 14.9999V9Z"
                      fill="#FFFFFF"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <span className="text-xs">{t.footer.copyright}</span>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <main className="max-w-6xl mx-auto px-8 py-24">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-semi-bold text-[#FFFFFF] mb-4">
                {t.results.title}
              </h1>
              <p className="text-base text-[#FFFFFF] font-extralight max-w-2xl mx-auto">
                {t.results.subtitle}
              </p>
            </div>

            {/* Draw Results Table */}
            <GlassmorphismDiv className="rounded-xs">
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className=" border-b border-[#dddddd]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                          {t.results.round}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                          {t.results.winnerAddress}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                          {t.results.amountWon}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-[#FFFFFF]">
                          {t.results.entries}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                          {t.results.verification}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dddddd]">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-red-500 text-lg mb-2">
                              {t.results.errorLoadingResults}
                            </div>
                            <div className="text-sm text-[#FFFFFF]">
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : rounds.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-xl text-[#FFFFFF] mb-4">
                              {t.results.noCompletedRounds}
                            </div>
                            <div className="text-sm text-[#FFFFFF]">
                              {t.results.noCompletedRoundsDesc}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rounds.map((round) => (
                          <tr key={round.roundNumber} className="">
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-[#FFFFFF]">
                                #{round.roundNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {/* Mobile: Truncated but clickable */}
                                <a
                                  href={getExplorerUrl(round.winner)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="md:hidden text-sm font-mono text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors cursor-pointer"
                                >
                                  {formatAddress(round.winner)}
                                </a>
                                {/* Desktop: Full address and clickable */}
                                <a
                                  href={getExplorerUrl(round.winner)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hidden md:inline text-sm font-mono text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors cursor-pointer"
                                >
                                  {round.winner}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="text-[#FFFFFF] font-semibold">
                                  {formatPayoutAmount(round)}
                                </div>
                                {formatSecondaryPayout(round) && (
                                  <div className="text-xs text-[#FFFFFF] mt-1">
                                    {formatSecondaryPayout(round)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[#FFFFFF]">
                                    {round.totalEntries} Cookie&apos;s
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-4">
                                {round.vrfTxHash ? (
                                  <a
                                    href={getVrfUrl(round.vrfTxHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors font-extralight cursor-pointer flex items-center space-x-1 group"
                                  >
                                    <Image
                                      src="/link.svg"
                                      alt="Link"
                                      width={12}
                                      height={12}
                                      className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                    <span>VRF</span>
                                  </a>
                                ) : (
                                  <span className="text-[#999999] font-extralight text-xs">
                                    N/A
                                  </span>
                                )}
                                {round.snapshotTxHash ? (
                                  <a
                                    href={getBscScanTxUrl(round.snapshotTxHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors font-extralight cursor-pointer flex items-center space-x-1 group"
                                  >
                                    <Image
                                      src="/link.svg"
                                      alt="Link"
                                      width={12}
                                      height={12}
                                      className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                    <span>{t.results.snapshot}</span>
                                  </a>
                                ) : (
                                  <span className="text-[#999999] font-extralight text-xs">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassmorphismDiv>

            {/* Back to Home */}
            <div className="pt-12 flex justify-center">
              <Link href="/">
                <EnterButton
                  onClick={() => console.log("Back to home clicked")}
                >
                  {t.common.backToHome}
                </EnterButton>
              </Link>
            </div>
          </main>
        )}
      </div>

      {/* Desktop Layout (unchanged) */}
      <main className="hidden md:block max-w-6xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semi-bold text-[#FFFFFF] mb-4">
            {t.results.title}
          </h1>
          <p className="text-base text-[#FFFFFF] font-extralight max-w-2xl mx-auto">
            {t.results.subtitle}
          </p>
        </div>

        {/* Draw Results Table */}
        <GlassmorphismDiv className="rounded-xs">
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className=" border-b border-[#dddddd]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                      {t.results.round}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                      {t.results.winnerAddress}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                      {t.results.amountWon}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-[#FFFFFF]">
                      {t.results.entries}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFFFFF]">
                      {t.results.verification}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dddddd]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-red-500 text-lg mb-2">
                          {t.results.errorLoadingResults}
                        </div>
                        <div className="text-sm text-[#FFFFFF]">{error}</div>
                      </td>
                    </tr>
                  ) : rounds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-xl text-[#FFFFFF] mb-4">
                          {t.results.noCompletedRounds}
                        </div>
                        <div className="text-sm text-[#FFFFFF]">
                          {t.results.noCompletedRoundsDesc}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rounds.map((round) => (
                      <tr key={round.roundNumber} className="">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-[#FFFFFF]">
                            #{round.roundNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {/* Mobile: Truncated but clickable */}
                            <a
                              href={getExplorerUrl(round.winner)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="md:hidden text-sm font-mono text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors cursor-pointer"
                            >
                              {formatAddress(round.winner)}
                            </a>
                            {/* Desktop: Full address and clickable */}
                            <a
                              href={getExplorerUrl(round.winner)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden md:inline text-sm font-mono text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors cursor-pointer"
                            >
                              {round.winner}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-[#FFFFFF] font-semibold">
                              {formatPayoutAmount(round)}
                            </div>
                            {formatSecondaryPayout(round) && (
                              <div className="text-xs text-[#FFFFFF] mt-1">
                                {formatSecondaryPayout(round)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-[#FFFFFF]">
                                {round.totalEntries} Cookie&apos;s
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-4">
                            {round.vrfTxHash ? (
                              <a
                                href={getVrfUrl(round.vrfTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors font-extralight cursor-pointer flex items-center space-x-1 group"
                              >
                                <Image
                                  src="/link.svg"
                                  alt="Link"
                                  width={12}
                                  height={12}
                                  className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <span>VRF</span>
                              </a>
                            ) : (
                              <span className="text-[#999999] font-extralight text-xs">
                                VRF N/A
                              </span>
                            )}
                            {round.snapshotTxHash ? (
                              <a
                                href={getBscScanTxUrl(round.snapshotTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#FFFFFF] hover:text-[#FFFFFF] hover:underline transition-colors font-extralight cursor-pointer flex items-center space-x-1 group"
                              >
                                <Image
                                  src="/link.svg"
                                  alt="Link"
                                  width={12}
                                  height={12}
                                  className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <span>{t.results.snapshot}</span>
                              </a>
                            ) : (
                              <span className="text-[#999999] font-extralight text-xs">
                                Snapshot N/A
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassmorphismDiv>

        {/* Back to Home */}
        <div className="pt-12 flex justify-center">
          <Link href="/">
            <EnterButton onClick={() => console.log("Back to home clicked")}>
              {t.common.backToHome}
            </EnterButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
