import { useState, useEffect } from "react";
import { getApiEndpoint } from "@/utils/api";

interface ProjectionEntry {
  wallet_address: string;
  token_ids: string[]; // ERC-404 encoded token IDs
}

interface ProjectionResponse {
  success: boolean;
  data: ProjectionEntry[];
}

// Decode ERC-404 high-bit to plain NFT id string
const ID_PREFIX = BigInt(
  "57896044618658097711785492504343953926634992332820282019728792003956564819968"
); // 1n << 255n
const decode404 = (s: string) => {
  const bi = BigInt(s);
  return bi >= ID_PREFIX ? (bi - ID_PREFIX).toString() : s;
};

export function useProjections() {
  const [projections, setProjections] = useState<ProjectionEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(getApiEndpoint("/api/current-projections"), {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json: ProjectionResponse = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        setProjections(json.data);

        // Calculate total count of all tokens across all wallets
        const total = json.data.reduce((acc, entry) => {
          return acc + (entry.token_ids?.length || 0);
        }, 0);
        setTotalCount(total);
      } else {
        setError("Invalid response from projections API");
        setProjections([]);
        setTotalCount(0);
      }
    } catch (e) {
      setError(
        `Failed to fetch projections: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
      setProjections([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjections();

    // Refresh every 30 seconds to get real-time updates
    const interval = setInterval(fetchProjections, 30000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to get decoded NFT data for display
  const getDecodedProjections = () => {
    return projections.map((entry) => ({
      wallet_address: entry.wallet_address,
      token_ids: entry.token_ids.map(decode404),
      nft_count: entry.token_ids.length,
    }));
  };

  return {
    projections,
    loading,
    error,
    totalCount,
    getDecodedProjections,
    refresh: fetchProjections,
  };
}
