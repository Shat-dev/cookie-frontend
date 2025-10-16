"use client";

import Link from "next/link";
import Header from "@/components/Header";
import EnterButton from "@/components/CoolButton";
import SimpleCountdown from "@/components/SimpleCountdown";
import VirtualizedNFTGrid from "@/components/VirtualizedNFTGrid";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePoolCount } from "@/hooks/usePoolCount";
import {
  useCurrentDraw,
  subscribeToDrawNotifications,
} from "@/hooks/useCurrentDraw";
import { useProjections } from "@/hooks/useProjections";
import { usePrizePool } from "@/hooks/usePrizePool";
import { getApiEndpoint } from "@/utils/api";
import Head from "next/head";
import { ethers } from "ethers";

// Isolated countdown component to prevent grid re-renders
function RefreshCountdown({
  refreshCountdown,
  onManualRefresh,
  isRefreshing,
}: {
  refreshCountdown: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex items-center">
      {refreshCountdown > 0 ? (
        <div className="text-xs sm:text-sm text-[#666666] font-mono">
          Next update: {Math.floor(refreshCountdown / 60)}:
          {(refreshCountdown % 60).toString().padStart(2, "0")}
        </div>
      ) : (
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono rounded-md border transition-colors ${
            isRefreshing
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-[#212427] border-[#212427] hover:bg-[#212427] hover:text-white"
          }`}
        >
          {isRefreshing ? (
            <div className="flex items-center">
              <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              Refreshing...
            </div>
          ) : (
            "Refresh Pool"
          )}
        </button>
      )}
    </div>
  );
}

export default function CurrentPool() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshCountdown, setRefreshCountdown] = useState<number>(180); // 3 minutes in seconds
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Filter state
  const [filterAddress, setFilterAddress] = useState<string>("");
  const [isValidFilterAddress, setIsValidFilterAddress] =
    useState<boolean>(false);
  const [filterNoEntries, setFilterNoEntries] = useState<boolean>(false);

  const { count: poolCount } = usePoolCount();
  const {
    drawNumber: currentDrawNumber,
    loading: drawLoading,
    automation,
    refetch: refetchDraw,
  } = useCurrentDraw();
  const {
    totalCount: projectionCount,
    getDecodedProjections,
    loading: projectionsLoading,
  } = useProjections();

  const {
    formattedUsd: prizePoolUsd,
    loading: prizePoolLoading,
    error: prizePoolError,
  } = usePrizePool();

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

  // Stable NFT array with diff-and-patch approach to prevent unnecessary re-renders
  const [stableNfts, setStableNfts] = useState<
    { tokenId: string; wallet: string }[]
  >([]);
  const nftsMapRef = useRef<Map<string, { tokenId: string; wallet: string }>>(
    new Map()
  );

  // Create NFT array from projections with stable identity
  const currentNfts = useMemo(() => {
    const decodedProjections = getDecodedProjections();
    const nftArray: { tokenId: string; wallet: string }[] = [];

    decodedProjections.forEach((projection) => {
      projection.token_ids.forEach((tokenId) => {
        nftArray.push({
          tokenId,
          wallet: projection.wallet_address,
        });
      });
    });

    return nftArray;
  }, [getDecodedProjections]);

  // Filter NFTs based on wallet address
  const filteredNfts = useMemo(() => {
    if (!isValidFilterAddress || !filterAddress) {
      return stableNfts;
    }

    const filtered = stableNfts.filter(
      (nft) => nft.wallet.toLowerCase() === filterAddress.toLowerCase()
    );

    // Track if valid address has no entries
    setFilterNoEntries(filtered.length === 0);

    // If no entries found for this wallet, return all NFTs
    if (filtered.length === 0) {
      return stableNfts;
    }

    return filtered;
  }, [stableNfts, filterAddress, isValidFilterAddress]);

  // Update stable NFTs only when actual tokenIds change (diff-and-patch)
  useEffect(() => {
    const newTokenIds = new Set(currentNfts.map((nft) => nft.tokenId));
    const currentTokenIds = new Set(Array.from(nftsMapRef.current.keys()));

    // Check if there are any actual changes
    const hasChanges =
      newTokenIds.size !== currentTokenIds.size ||
      !Array.from(newTokenIds).every((id) => currentTokenIds.has(id));

    if (hasChanges) {
      // Update the map and stable array
      const newMap = new Map<string, { tokenId: string; wallet: string }>();
      currentNfts.forEach((nft) => {
        newMap.set(nft.tokenId, nft);
      });

      nftsMapRef.current = newMap;
      setStableNfts(currentNfts);

      // Check if filtered wallet lost all entries after refresh
      if (isValidFilterAddress && filterAddress) {
        const walletStillHasEntries = currentNfts.some(
          (nft) => nft.wallet.toLowerCase() === filterAddress.toLowerCase()
        );

        if (!walletStillHasEntries && !filterNoEntries) {
          // Wallet had entries before but lost them all - clear filter
          setFilterAddress("");
          setIsValidFilterAddress(false);
          setFilterNoEntries(false);
          // Show notice (will be handled by temporary notice state)
        }
      }
    }
  }, [currentNfts, filterAddress, isValidFilterAddress, filterNoEntries]);

  // Handle filter address change
  const handleFilterAddressChange = (value: string) => {
    setFilterAddress(value);

    if (!value) {
      setIsValidFilterAddress(false);
      setFilterNoEntries(false);
      return;
    }

    // Validate address
    if (ethers.isAddress(value)) {
      setIsValidFilterAddress(true);
    } else {
      setIsValidFilterAddress(false);
      setFilterNoEntries(false);
    }
  };

  // Clear filter
  const clearFilter = () => {
    setFilterAddress("");
    setIsValidFilterAddress(false);
    setFilterNoEntries(false);
  };

  // ✅ NEW: Enhanced display count logic using automation data
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

  // —— StrictMode / interval guards
  const poolLoaded = useRef(false);
  const fetchingPool = useRef(false);
  const effectStarted = useRef(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCurrentPool = useCallback(async () => {
    if (fetchingPool.current) return;
    fetchingPool.current = true;
    const isInitial = !poolLoaded.current;

    try {
      if (isInitial) setLoading(true);
      setError("");

      // ✅ NEW: Also refresh draw data alongside pool data for better sync
      await Promise.all([
        fetch(getApiEndpoint("/api/current-pool"), { cache: "no-store" }),
        fetch(getApiEndpoint("/api/current-projections"), {
          cache: "no-store",
        }),
        refetchDraw(), // Refresh draw data too
      ]);

      // Reset countdown after successful fetch
      setRefreshCountdown(180); // Reset to 3 minutes
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch pool/projections"
      );
    } finally {
      if (isInitial) {
        setLoading(false);
        poolLoaded.current = true;
      }
      fetchingPool.current = false;
    }
  }, [refetchDraw]);

  // Manual refresh function for the button
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCurrentPool();
    setIsRefreshing(false);
  }, [fetchCurrentPool]);

  // Optimized countdown timer effect with cleanup
  useEffect(() => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // When countdown hits 0, trigger automatic refresh with visual feedback
          console.log("Auto-refreshing NFT pool...");
          setIsRefreshing(true);
          fetchCurrentPool().finally(() => {
            setIsRefreshing(false);
          });
          return 180; // Reset to 3 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [fetchCurrentPool]); // Include fetchCurrentPool in dependencies

  useEffect(() => {
    if (effectStarted.current) return;
    effectStarted.current = true;

    void fetchCurrentPool(); // Initial fetch only

    return () => {
      // Cleanup handled by countdown effect
    };
  }, [fetchCurrentPool]);

  return (
    <>
      {/* Preconnect hints for faster image loading */}
      <Head>
        <link
          rel="preconnect"
          href="https://gateway.pinata.cloud"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://dweb.link"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://ipfs.io" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://cyan-cautious-hare-412.mypinata.cloud"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://nftstorage.link"
          crossOrigin="anonymous"
        />
      </Head>

      <div className="min-h-screen bg-[#fff49b] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
        {/* Header: desktop offset preserved, no desktop shift */}
        <div className="pt-[env(safe-area-inset-top)] py-6 md:pt-0 md:-mt-4">
          <Header
            currentPage="current-pool"
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
                    ERC-404 POWERED LOTTERY ON BNB
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
                    <span className="text-xs">fortunecookie.xyz 2025</span>
                  </div>
                </div>
              </footer>
            </div>
          ) : (
            <main className="max-w-4xl py-24 mx-auto px-2">
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-semi-bold text-[#212427] mb-4">
                  Current Pool
                </h1>
                <p className="text-base sm:text-lg text-[#666666] font-thin">
                  View the current pool information
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Pool Statistics */}
                <div className="rounded-xs">
                  <section className="p-4 sm:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 sm:gap-6 gap-y-12">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                          {prizePoolLoading ? (
                            <div className="h-6 w-6 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                          ) : prizePoolError ? (
                            <span className="text-[#212427]">$2,000</span>
                          ) : (
                            prizePoolUsd
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-[#666666] font-thin">
                          Total Prize Pool
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                          {isCountLoading ? (
                            <div className="h-6 w-6 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                          ) : (
                            displayCount
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-[#666666] font-thin">
                          Active Entries
                        </div>
                        {/* ✅ NEW: Show automation entry count if different from display count */}
                        {automation?.totalEntries &&
                          automation.totalEntries !== displayCount && (
                            <div className="text-xs text-[#888888] mt-1">
                              Database: {automation.totalEntries}
                            </div>
                          )}
                      </div>

                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                          <SimpleCountdown />
                        </div>
                        <div className="text-sm sm:text-base text-[#666666] font-thin">
                          Time Left
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                          {drawLoading ? (
                            <div className="h-6 sm:h-8 w-8 sm:w-12 animate-pulse rounded mx-auto"></div>
                          ) : (
                            currentDrawNumber || 1
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-[#666666] font-thin">
                          Draw Number
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* NFT Pool */}
                <div className="rounded-xs">
                  <section className="p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                      <h2 className="text-lg sm:text-xl font-semi-bold text-[#212427]">
                        Live Cookie pool (
                        {isValidFilterAddress && !filterNoEntries
                          ? filteredNfts.length
                          : displayCount}{" "}
                        entries)
                      </h2>

                      {/* Countdown/Refresh Button - Isolated Component */}
                      <div className="self-start sm:self-auto">
                        <RefreshCountdown
                          refreshCountdown={refreshCountdown}
                          onManualRefresh={handleManualRefresh}
                          isRefreshing={isRefreshing}
                        />
                      </div>
                    </div>

                    <div className="rounded-xs">
                      <section className="p-2 py-4">
                        <div className="max-w-md mx-auto">
                          <div className="relative">
                            <input
                              type="text"
                              value={filterAddress}
                              onChange={(e) =>
                                handleFilterAddressChange(e.target.value)
                              }
                              placeholder="Enter Wallet Address"
                              className="w-full px-4 py-3 pr-20 border border-[#dddddd] rounded-lg focus:outline-none focus:ring-0 focus:border-[#dddddd] font-mono text-sm"
                            />
                            {filterAddress && (
                              <button
                                onClick={clearFilter}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#212427] transition-colors font-thin cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Show validation/status messages */}
                          {filterAddress && !isValidFilterAddress && (
                            <p className="text-[#666666] text-xs mt-2 text-center">
                              Please enter a valid wallet address
                            </p>
                          )}

                          {isValidFilterAddress && filterNoEntries && (
                            <p className="text-[#666666] text-xs mt-2 text-center">
                              No entries detected. Recent posts may still be
                              syncing.
                            </p>
                          )}

                          {isValidFilterAddress &&
                            !filterNoEntries &&
                            filteredNfts.length > 0 && (
                              <p className="text-[#212427] text-xs mt-2 text-center">
                                Wallet currently has {filteredNfts.length}{" "}
                                entries.
                              </p>
                            )}
                        </div>
                      </section>
                    </div>

                    {/* Show spinner ONLY on the very first load */}
                    {!poolLoaded.current && loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                      </div>
                    ) : error ? (
                      <p className="text-center text-[#212427] text-sm">
                        {error}
                      </p>
                    ) : filteredNfts.length === 0 && !filterNoEntries ? (
                      <p className="text-center text-[#666666] text-sm">
                        No NFTs yet. Waiting for tweets...
                      </p>
                    ) : (
                      <VirtualizedNFTGrid
                        nfts={filteredNfts}
                        loading={loading}
                        error={error}
                      />
                    )}
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
        <main className="hidden md:block max-w-4xl py-12 mx-auto px-2">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-semi-bold text-[#212427] mb-4">
              Current Pool
            </h1>
            <p className="text-base sm:text-lg text-[#666666] font-thin">
              View the current pool information
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Pool Statistics */}
            <div className="rounded-xs">
              <section className="p-4 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 sm:gap-6 gap-y-12">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                      {prizePoolLoading ? (
                        <div className="h-6 w-6 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                      ) : prizePoolError ? (
                        <span className="text-[#212427]">$2,000</span>
                      ) : (
                        prizePoolUsd
                      )}
                    </div>
                    <div className="text-sm sm:text-base text-[#666666] font-thin">
                      Total Prize Pool
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                      {isCountLoading ? (
                        <div className="h-6 w-6 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin mx-auto" />
                      ) : (
                        displayCount
                      )}
                    </div>
                    <div className="text-sm sm:text-base text-[#666666] font-thin">
                      Active Entries
                    </div>
                    {/* ✅ NEW: Show automation entry count if different from display count */}
                    {automation?.totalEntries &&
                      automation.totalEntries !== displayCount && (
                        <div className="text-xs text-[#888888] mt-1">
                          Database: {automation.totalEntries}
                        </div>
                      )}
                  </div>

                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                      <SimpleCountdown />
                    </div>
                    <div className="text-sm sm:text-base text-[#666666] font-thin">
                      Time Left
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-semi-bold text-[#212427] mb-2">
                      {drawLoading ? (
                        <div className="h-6 sm:h-8 w-8 sm:w-12 animate-pulse rounded mx-auto"></div>
                      ) : (
                        currentDrawNumber || 1
                      )}
                    </div>
                    <div className="text-sm sm:text-base text-[#666666] font-thin">
                      Draw Number
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* NFT Pool */}
            <div className="rounded-xs">
              <section className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-semi-bold text-[#212427]">
                    Live Cookie pool (
                    {isValidFilterAddress && !filterNoEntries
                      ? filteredNfts.length
                      : displayCount}{" "}
                    entries)
                  </h2>

                  {/* Countdown/Refresh Button - Isolated Component */}
                  <div className="self-start sm:self-auto">
                    <RefreshCountdown
                      refreshCountdown={refreshCountdown}
                      onManualRefresh={handleManualRefresh}
                      isRefreshing={isRefreshing}
                    />
                  </div>
                </div>

                <div className="rounded-xs">
                  <section className="p-2 py-4">
                    <div className="max-w-md mx-auto">
                      <div className="relative">
                        <input
                          type="text"
                          value={filterAddress}
                          onChange={(e) =>
                            handleFilterAddressChange(e.target.value)
                          }
                          placeholder="Enter Wallet Address"
                          className="w-full px-4 py-3 pr-20 border border-[#dddddd] rounded-lg focus:outline-none focus:ring-0 focus:border-[#dddddd] font-mono text-sm"
                        />
                        {filterAddress && (
                          <button
                            onClick={clearFilter}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#212427] transition-colors font-thin cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Show validation/status messages */}
                      {filterAddress && !isValidFilterAddress && (
                        <p className="text-[#666666] text-xs mt-2 text-center">
                          Please enter a valid wallet address
                        </p>
                      )}

                      {isValidFilterAddress && filterNoEntries && (
                        <p className="text-[#666666] text-xs mt-2 text-center">
                          No entries detected. Recent posts may still be
                          syncing.
                        </p>
                      )}

                      {isValidFilterAddress &&
                        !filterNoEntries &&
                        filteredNfts.length > 0 && (
                          <p className="text-[#212427] text-xs mt-2 text-center">
                            Wallet currently has {filteredNfts.length} entries.
                          </p>
                        )}
                    </div>
                  </section>
                </div>

                {/* Show spinner ONLY on the very first load */}
                {!poolLoaded.current && loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <p className="text-center text-[#212427] text-sm">{error}</p>
                ) : filteredNfts.length === 0 && !filterNoEntries ? (
                  <p className="text-center text-[#666666] text-sm">
                    No NFTs yet. Waiting for tweets...
                  </p>
                ) : (
                  <VirtualizedNFTGrid
                    nfts={filteredNfts}
                    loading={loading}
                    error={error}
                  />
                )}
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
    </>
  );
}
