import { useState, useEffect } from "react";
import { getApiEndpoint } from "@/utils/api";
import { fetchSingleton } from "@/utils/fetchSingleton";

interface PoolEntry {
  wallet_address: string;
  token_ids: string[];
}

interface PoolResponse {
  success: boolean;
  data: PoolEntry[];
  round?: number;
}

export function usePoolCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchPoolCount = async () => {
    try {
      setLoading(true);
      setError("");

      const json = await fetchSingleton<PoolResponse>(
        getApiEndpoint("/api/current-pool"),
        {
          cache: "no-store",
        }
      );

      if (json?.success && Array.isArray(json.data)) {
        // Calculate total count from all token_ids arrays
        const totalCount = json.data.reduce((acc, entry) => {
          return acc + (entry.token_ids?.length || 0);
        }, 0);
        setCount(totalCount);
      } else if (Array.isArray(json)) {
        // Fallback for direct array response
        const totalCount = json.reduce((acc, entry) => {
          return acc + (entry.token_ids?.length || 0);
        }, 0);
        setCount(totalCount);
      } else {
        setError("Unexpected response from server");
        setCount(0);
      }
    } catch {
      setError("Failed to fetch current pool");
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolCount();

    // Refresh every 30 seconds
    const id = setInterval(fetchPoolCount, 30_000);
    return () => clearInterval(id);
  }, []);

  return { count, loading, error, refetch: fetchPoolCount };
}
