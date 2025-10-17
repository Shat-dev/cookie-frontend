"use client";

import Header from "@/components/Header";
import Link from "next/link";
import EnterButton from "@/components/CoolButton";
import GlassmorphismDiv from "@/components/GlassmorphismDiv";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import address from "../../../constants/LotteryVrfV25Address.json";
import abi from "../../../constants/LotteryVrfV25ABI.json";
import { getApiUrl } from "@/utils/api";

// Backend API endpoint for lottery results
const API_BASE_URL = getApiUrl();

// Lottery contract details for blockchain fetching - automatically imported from constants
const LOTTERY_ADDRESS = address.LotteryVrfV25;
const LOTTERY_ABI = abi;

// Cache configuration
const CACHE_KEY = "lottery-rounds-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Validation
if (!LOTTERY_ADDRESS) {
  throw new Error("Lottery contract address not found in constants file");
}

if (!LOTTERY_ABI || LOTTERY_ABI.length === 0) {
  throw new Error("Lottery ABI not found in constants file");
}

// Debug logging
console.log("📋 Contract Configuration:");
console.log("   Address:", LOTTERY_ADDRESS);
console.log("   Network:", address.network);
console.log("   Chain ID:", address.chainId);
console.log("   ABI Functions:", LOTTERY_ABI.length);
console.log("   Deployed:", address.deployedAt);

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
            <div className="w-8 h-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mb-4"></div>
            <div className="text-[#666666] text-sm font-thin whitespace-nowrap">
              Loading lottery results...
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Normal table centering */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mb-4"></div>
        <div className="text-[#666666] text-sm font-thin">
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
        setContractAddress("0x6B60298f5Ab2D4B133D4385a73B17e95B16AA2aD"); // Fallback
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

    // Only show loading spinner for initial loads or when explicitly requested
    if (showLoading && isInitialLoad) {
      setIsLoading(true);
    }

    try {
      let allRounds: LotteryRound[] = [];

      // 1) Backend (historical)
      try {
        const response = await fetch(`${API_BASE_URL}/api/lottery/results`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Map backend data to include any payout information
            allRounds = data.data.map(
              (round: {
                roundNumber: number;
                winner: string;
                winningTokenId: string;
                totalEntries: string; // ✅ FIX: Use totalEntries (matches backend response)
                requestId?: string;
                timestamp?: string;
                payoutAmount?: string;
                payoutAmountUsd?: number;
                snapshotTxHash?: string;
              }) => ({
                roundNumber: round.roundNumber,
                winner: round.winner,
                winningTokenId: round.winningTokenId,
                totalEntries: round.totalEntries, // ✅ FIX: Use backend count
                startTime: round.timestamp || new Date().toISOString(),
                endTime: round.timestamp || new Date().toISOString(),
                isCompleted: true,
                requestId: round.requestId || "0",
                payoutAmount: round.payoutAmount,
                payoutAmountUsd: round.payoutAmountUsd,
                snapshotTxHash: round.snapshotTxHash,
              })
            );

            console.log(
              `✅ Backend API returned ${allRounds.length} completed rounds with entry counts and snapshot hashes`
            );

            // Debug: Log snapshot transaction hashes
            allRounds.forEach((round) => {
              if (round.snapshotTxHash) {
                console.log(
                  `📦 Round ${round.roundNumber}: Snapshot TX ${round.snapshotTxHash}`
                );
              } else {
                console.log(
                  `📦 Round ${round.roundNumber}: No snapshot TX hash available`
                );
              }
            });
          }
        }
      } catch {
        if (isInitialLoad) {
          console.log("Backend fetch failed, continuing with blockchain…");
        }
      }

      // 2) Blockchain (latest)
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BNB_TESTNET_RPC ||
            "https://bsc-testnet-rpc.publicnode.com"
        );

        const lottery = new ethers.Contract(
          LOTTERY_ADDRESS,
          LOTTERY_ABI,
          provider
        );

        const currentRound = await lottery.s_currentRound();
        const currentRoundNumber = Number(currentRound);

        if (currentRoundNumber === 0) {
          setRounds(allRounds);
          setLastUpdated(new Date());
          setError(null);
          if (allRounds.length > 0) {
            setCachedRounds(allRounds);
          }
          if (isInitialLoad) setIsLoading(false);
          return;
        }

        for (let i = 1; i <= currentRoundNumber; i++) {
          try {
            const roundData = await lottery.getRound(i);

            if (
              roundData.isCompleted &&
              roundData.winner !== ethers.ZeroAddress
            ) {
              const existingRound = allRounds.find((r) => r.roundNumber === i);
              if (!existingRound) {
                console.log(
                  `🔗 Fetching blockchain data for round ${i} (not in backend)`
                );
                // Fetch the requestId from RandomnessRequested events
                let requestId = "0";
                try {
                  const filter = lottery.filters.RandomnessRequested(i);
                  const events = await lottery.queryFilter(filter);
                  if (events.length > 0) {
                    const event = events[events.length - 1];
                    if ("args" in event) {
                      requestId = event.args.requestId.toString();
                    }
                  }
                } catch (eventErr) {
                  console.log(
                    `Error fetching requestId for round ${i}:`,
                    eventErr
                  );
                }

                // ✅ FIX: Use backend data for entry count (more reliable than blockchain)
                // The backend now uses the same query as manual-vrf-draw.ts
                const deduplicatedCount = roundData.totalEntries.toString();
                console.log(
                  `Round ${i}: Using blockchain totalEntries as fallback: ${deduplicatedCount}`
                );

                // Try to get payout amount from FeePayoutSuccess events
                let payoutAmount = undefined;
                let payoutAmountUsd = undefined;
                try {
                  const payoutFilter = lottery.filters.FeePayoutSuccess(i);
                  const payoutEvents = await lottery.queryFilter(payoutFilter);
                  if (payoutEvents.length > 0) {
                    const payoutEvent = payoutEvents[payoutEvents.length - 1];
                    if ("args" in payoutEvent && payoutEvent.args.length >= 3) {
                      const payoutWei = payoutEvent.args[2];
                      payoutAmount = ethers.formatEther(payoutWei);

                      // Convert to USD (simplified - could cache this)
                      try {
                        const response = await fetch(
                          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
                        );
                        if (response.ok) {
                          const data = (await response.json()) as {
                            ethereum?: { usd?: number };
                          };
                          const ethPriceUsd = data.ethereum?.usd || 0;
                          payoutAmountUsd =
                            parseFloat(payoutAmount) * ethPriceUsd;
                        }
                      } catch (priceError) {
                        console.warn("Failed to fetch ETH price:", priceError);
                      }
                    }
                  }
                } catch (payoutErr) {
                  console.log(
                    `Warning: Could not fetch payout for round ${i}:`,
                    payoutErr
                  );
                }

                const newRound: LotteryRound = {
                  roundNumber: i,
                  winner: roundData.winner,
                  winningTokenId: roundData.winningTokenId.toString(),
                  totalEntries: deduplicatedCount, // ✅ Use deduplicated count
                  startTime: new Date(
                    Number(roundData.startTime) * 1000
                  ).toISOString(),
                  endTime: new Date(
                    Number(roundData.endTime) * 1000
                  ).toISOString(),
                  isCompleted: roundData.isCompleted,
                  requestId: requestId,
                  payoutAmount: payoutAmount,
                  payoutAmountUsd: payoutAmountUsd,
                  snapshotTxHash: undefined, // Not available from blockchain data
                };
                allRounds.push(newRound);
              }
            }
          } catch (err) {
            console.log(`Error fetching round ${i} from blockchain:`, err);
          }
        }
      } catch (err) {
        console.log("Blockchain fetch failed:", err);
      }

      // Sort newest first
      allRounds.sort((a, b) => b.roundNumber - a.roundNumber);

      // Update state and cache
      setRounds(allRounds);
      setLastUpdated(new Date());
      setError(null);

      // Cache the results for future page loads
      if (allRounds.length > 0) {
        setCachedRounds(allRounds);
      }
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

  const VRF_COORDINATOR = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"; // VRF Coordinator for VRF verification links
  const getVrfUrl = (requestId: string) =>
    `https://basescan.org/address/${VRF_COORDINATOR}#eventlog?query=requestId:${requestId}`;

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatPayoutAmount = (round: LotteryRound) => {
    // Display priority: USD amount > ETH amount > fallback message
    // Fetched from FeePayoutSuccess events on smart contract
    if (round.payoutAmountUsd && round.payoutAmountUsd > 0) {
      return `$${round.payoutAmountUsd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (round.payoutAmount && parseFloat(round.payoutAmount) > 0) {
      return `${parseFloat(round.payoutAmount).toFixed(4)} ETH`;
    } else {
      // For older rounds or rounds with missing payout data
      return "Amount TBD";
    }
  };

  const formatSecondaryPayout = (round: LotteryRound) => {
    // Show ETH amount as secondary info when USD is primary
    if (
      round.payoutAmountUsd &&
      round.payoutAmount &&
      parseFloat(round.payoutAmount) > 0
    ) {
      return `${parseFloat(round.payoutAmount).toFixed(4)} ETH`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fff49b] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
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
            <footer className="fixed bottom-0 left-0 right-0 bg-[#fff49b] z-50 font-['Fira_Code'] text-[#666666] h-[72px] overflow-hidden">
              <div className="fixed bottom-0 left-0 right-0 z-0 flex flex-col items-center py-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
                <div className="text-xs text-[#666666] font-mono text-center">
                  ERC-404 POWERED Cookie LOTTERY ON BASE
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
          <main className="max-w-6xl mx-auto px-8 py-24">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
                Draw Results & Verification
              </h1>
              <p className="text-base text-[#666666] font-thin max-w-2xl mx-auto">
                All draws use VRF for provable fairness.
              </p>
            </div>

            {/* Draw Results Table */}
            <GlassmorphismDiv className="rounded-xs">
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className=" border-b border-[#dddddd]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                          ROUND
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                          WINNER ADDRESS
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                          AMOUNT WON
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium uppercase text-[#212427]">
                          Entries
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                          VERIFICATION
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
                              Error loading results
                            </div>
                            <div className="text-sm text-[#666666]">
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : rounds.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-xl text-[#666666] mb-4">
                              No completed lottery rounds yet
                            </div>
                            <div className="text-sm text-[#666666]">
                              Complete rounds will appear here once VRF results
                              are finalized
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rounds.map((round) => (
                          <tr key={round.roundNumber} className="">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-[#212427]">
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
                                  className="md:hidden text-sm font-mono text-[#212427] hover:text-[#666666] hover:underline transition-colors cursor-pointer"
                                >
                                  {formatAddress(round.winner)}
                                </a>
                                {/* Desktop: Full address and clickable */}
                                <a
                                  href={getExplorerUrl(round.winner)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hidden md:inline text-sm font-mono text-[#212427] hover:text-[#666666] hover:underline transition-colors cursor-pointer"
                                >
                                  {round.winner}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="text-[#212427] font-medium">
                                  {formatPayoutAmount(round)}
                                </div>
                                {formatSecondaryPayout(round) && (
                                  <div className="text-xs text-[#666666] mt-1">
                                    {formatSecondaryPayout(round)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[#212427]">
                                    {round.totalEntries} Cookie&apos;s
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-4">
                                <a
                                  href={getVrfUrl(round.requestId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#666666] hover:text-[#212427] hover:underline transition-colors font-thin cursor-pointer flex items-center space-x-1 group"
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
                                {round.snapshotTxHash ? (
                                  <a
                                    href={getBscScanTxUrl(round.snapshotTxHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#666666] hover:text-[#212427] hover:underline transition-colors font-thin cursor-pointer flex items-center space-x-1 group"
                                  >
                                    <Image
                                      src="/link.svg"
                                      alt="Link"
                                      width={12}
                                      height={12}
                                      className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                    <span>Snapshot</span>
                                  </a>
                                ) : (
                                  <span className="text-[#999999] font-thin text-xs">
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
                <EnterButton
                  onClick={() => console.log("Back to home clicked")}
                >
                  Back to Home
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
          <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
            Draw Results & Verification
          </h1>
          <p className="text-base text-[#666666] font-thin max-w-2xl mx-auto">
            All draws use VRF for provable fairness.
          </p>
        </div>

        {/* Draw Results Table */}
        <GlassmorphismDiv className="rounded-xs">
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className=" border-b border-[#dddddd]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                      ROUND
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                      WINNER ADDRESS
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                      AMOUNT WON
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase text-[#212427]">
                      Entries
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#212427]">
                      VERIFICATION
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
                          Error loading results
                        </div>
                        <div className="text-sm text-[#666666]">{error}</div>
                      </td>
                    </tr>
                  ) : rounds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-xl text-[#666666] mb-4">
                          No completed lottery rounds yet
                        </div>
                        <div className="text-sm text-[#666666]">
                          Complete rounds will appear here once VRF results are
                          finalized
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rounds.map((round) => (
                      <tr key={round.roundNumber} className="">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#212427]">
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
                              className="md:hidden text-sm font-mono text-[#212427] hover:text-[#666666] hover:underline transition-colors cursor-pointer"
                            >
                              {formatAddress(round.winner)}
                            </a>
                            {/* Desktop: Full address and clickable */}
                            <a
                              href={getExplorerUrl(round.winner)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden md:inline text-sm font-mono text-[#212427] hover:text-[#666666] hover:underline transition-colors cursor-pointer"
                            >
                              {round.winner}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-[#212427] font-medium">
                              {formatPayoutAmount(round)}
                            </div>
                            {formatSecondaryPayout(round) && (
                              <div className="text-xs text-[#666666] mt-1">
                                {formatSecondaryPayout(round)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-[#212427]">
                                {round.totalEntries} Cookie&apos;s
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-4">
                            <a
                              href={getVrfUrl(round.requestId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#666666] hover:text-[#212427] hover:underline transition-colors font-thin cursor-pointer flex items-center space-x-1 group"
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
                            {round.snapshotTxHash ? (
                              <a
                                href={getBscScanTxUrl(round.snapshotTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#666666] hover:text-[#212427] hover:underline transition-colors font-thin cursor-pointer flex items-center space-x-1 group"
                              >
                                <Image
                                  src="/link.svg"
                                  alt="Link"
                                  width={12}
                                  height={12}
                                  className="filter brightness-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <span>Snapshot</span>
                              </a>
                            ) : (
                              <span className="text-[#999999] font-thin text-xs">
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
              Back to Home
            </EnterButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
