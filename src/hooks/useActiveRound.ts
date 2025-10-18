import { useState, useEffect, useRef } from "react";
import { getApiEndpoint } from "@/utils/api";
import { fetchSingleton } from "@/utils/fetchSingleton";

interface ActiveRoundData {
  round_number: number;
  status: "active" | "drawing" | "completed";
  total_entries: number;
}

interface ActiveRoundResponse {
  success: boolean;
  data?: {
    round: ActiveRoundData;
    entries: unknown[];
  };
  message?: string;
}

// Simple cache for the active round
let cachedRoundNumber: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export const useActiveRound = () => {
  const [roundNumber, setRoundNumber] = useState<number | null>(
    cachedRoundNumber
  );
  const [loading, setLoading] = useState(!cachedRoundNumber);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchActiveRound = async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError(null);

      const result = await fetchSingleton<ActiveRoundResponse>(
        getApiEndpoint("/api/lottery/rounds/active"),
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (result.success && result.data?.round) {
        const newRoundNumber = result.data.round.round_number;

        // Update cache
        cachedRoundNumber = newRoundNumber;
        cacheTimestamp = Date.now();

        setRoundNumber(newRoundNumber);
        setLoading(false);

        return newRoundNumber;
      } else {
        throw new Error(result.message || "No active round found");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch active round";
      console.error("❌ Error fetching active round:", errorMessage);
      setError(errorMessage);

      // If we have no cached value, set a reasonable fallback
      if (!cachedRoundNumber) {
        cachedRoundNumber = 1;
        setRoundNumber(1);
      }
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  const refetch = () => {
    // Clear cache to force fresh fetch
    cachedRoundNumber = null;
    cacheTimestamp = 0;
    setLoading(true);
    fetchActiveRound();
  };

  useEffect(() => {
    // If we have fresh cached data, use it immediately
    if (cachedRoundNumber && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setRoundNumber(cachedRoundNumber);
      setLoading(false);
      return;
    }

    // Otherwise fetch fresh data
    fetchActiveRound();

    // Set up periodic refresh
    const interval = setInterval(() => {
      if (!cachedRoundNumber || Date.now() - cacheTimestamp > CACHE_DURATION) {
        fetchActiveRound();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    roundNumber: roundNumber || 1, // Always return at least 1
    loading,
    error,
    refetch,
  };
};
