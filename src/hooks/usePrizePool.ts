import { useState, useEffect, useCallback, useRef } from "react";
import { getApiEndpoint } from "@/utils/api";

interface PrizePoolData {
  balance_eth: string;
  balance_wei: string;
  eth_price_usd: number;
  prize_pool_usd: number;
  last_updated: string;
}

interface PrizePoolState {
  data: PrizePoolData | null;
  loading: boolean;
  error: string | null;
  lastFetch: number;
}

const CACHE_DURATION = 60_000; // 1 minute cache
const REFRESH_INTERVAL = 30_000; // Refresh every 30 seconds

export function usePrizePool() {
  const [state, setState] = useState<PrizePoolState>({
    data: null,
    loading: true,
    error: null,
    lastFetch: 0,
  });

  const fetchingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrizePool = useCallback(
    async (force = false) => {
      // Prevent duplicate requests
      if (fetchingRef.current) return;

      // Check cache validity
      const now = Date.now();
      if (!force && state.data && now - state.lastFetch < CACHE_DURATION) {
        return;
      }

      fetchingRef.current = true;

      try {
        const response = await fetch(
          getApiEndpoint("/api/lottery/prize-pool"),
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch prize pool");
        }

        setState({
          data: result.data,
          loading: false,
          error: null,
          lastFetch: now,
        });
      } catch (error) {
        console.error("Error fetching prize pool:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      } finally {
        fetchingRef.current = false;
      }
    },
    [state.data, state.lastFetch]
  );

  // Auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchPrizePool();

    // Set up interval for regular updates
    intervalRef.current = setInterval(() => {
      fetchPrizePool();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPrizePool]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchPrizePool(true);
  }, [fetchPrizePool]);

  // Helper functions for formatted values
  const getFormattedUsdValue = useCallback(() => {
    if (!state.data) return "$0.00";

    const { prize_pool_usd } = state.data;
    if (prize_pool_usd >= 1000000) {
      return `$${(prize_pool_usd / 1000000).toFixed(2)}M`;
    } else if (prize_pool_usd >= 1000) {
      return `$${(prize_pool_usd / 1000).toFixed(2)}K`;
    } else {
      return `$${prize_pool_usd.toFixed(2)}`;
    }
  }, [state.data]);

  const getFormattedEthValue = useCallback(() => {
    if (!state.data) return "0.00 ETH";
    return `${parseFloat(state.data.balance_eth).toFixed(4)} ETH`;
  }, [state.data]);

  return {
    // Raw data
    data: state.data,
    loading: state.loading,
    error: state.error,

    // Formatted helpers
    formattedUsd: getFormattedUsdValue(),
    formattedEth: getFormattedEthValue(),

    // Actions
    refresh,

    // Status helpers
    isStale: state.data ? Date.now() - state.lastFetch > CACHE_DURATION : false,
    lastUpdated: state.data?.last_updated,
  };
}
