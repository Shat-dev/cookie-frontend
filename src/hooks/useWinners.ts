import { useState, useEffect, useRef, useCallback } from "react";
import { getApiEndpoint } from "@/utils/api";
import { fetchSingleton } from "@/utils/fetchSingleton";

interface Winner {
  drawNumber: number;
  amount: number;
  nftImageUrl: string;
  winnerAddress: string;
  tokenId: string;
  loading?: boolean;
}

interface BackendWinner {
  id: number;
  round_id: number;
  wallet_address: string;
  token_id: string;
  image_url: string;
  prize_amount?: string;
  payout_amount?: string;
  payout_status: string;
  created_at: string;
}

// Global cache for winners data
let cachedWinners: Winner[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const useWinners = () => {
  const [winners, setWinners] = useState<Winner[]>(cachedWinners || []);
  const [loading, setLoading] = useState(!cachedWinners);
  const fetchingRef = useRef(false);

  // Function to get NFT image directly from IPFS
  const getNftImageUrl = (tokenId: string): string => {
    try {
      // Extract the base NFT ID from the ERC-404 token
      const bigIntId = BigInt(tokenId);
      const isHighBit = bigIntId > BigInt(1) << BigInt(255);

      let nftId: number;
      if (isHighBit) {
        const decoded = bigIntId - (BigInt(1) << BigInt(255));
        nftId = Number(decoded);
      } else {
        nftId = Number(bigIntId);
      }

      const availableImages = [
        "154",
        "1025",
        "2025",
        "234",
        "3025",
        "4025",
        "5025",
        "6025",
        "7025",
        "8025",
        "89",
        "9025",
      ];
      const imageIndex = nftId % availableImages.length;
      return `/Generated-Images/${availableImages[imageIndex]}.png`;
    } catch {
      return `/Generated-Images/154.png`; // Fallback image
    }
  };

  const fetchWinners = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // Check if we have fresh cached data
      if (cachedWinners && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setWinners(cachedWinners);
        setLoading(false);
        return;
      }

      // Use backend API for winners
      const data = await fetchSingleton<{
        success: boolean;
        data?: BackendWinner[];
        error?: string;
      }>(getApiEndpoint("/api/lottery/winners?limit=10"), {
        cache: "no-store",
      });

      if (data.success && Array.isArray(data.data)) {
        const backendWinners: Winner[] = data.data.map(
          (winner: BackendWinner) => {
            const tokenId = winner.token_id || "0";
            return {
              drawNumber: winner.round_id || 0,
              amount: parseFloat(
                winner.prize_amount || winner.payout_amount || "0"
              ),
              nftImageUrl: getNftImageUrl(tokenId),
              winnerAddress: winner.wallet_address || "",
              tokenId,
            };
          }
        );

        // Update cache
        cachedWinners = backendWinners;
        cacheTimestamp = Date.now();
        setWinners(backendWinners);
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching winners:", error);
      // Keep existing data if available
      if (!cachedWinners) {
        setWinners([]);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchWinners();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      if (Date.now() - cacheTimestamp > CACHE_DURATION) {
        fetchWinners();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchWinners]);

  return {
    winners,
    loading,
    refetch: fetchWinners,
  };
};
