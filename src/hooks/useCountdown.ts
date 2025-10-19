import { useState, useEffect, useRef, useCallback } from "react";
import { getApiEndpoint } from "@/utils/api";
import { fetchSingleton } from "@/utils/fetchSingleton";

interface CountdownState {
  phase: "starting" | "countdown" | "selecting" | "winner" | "new_round";
  remainingSeconds: number;
  isActive: boolean;
}

interface BackendCountdownResponse {
  success: boolean;
  phase: "starting" | "countdown" | "selecting" | "winner" | "new_round";
  remainingSeconds: number;
  endsAt?: string; // ISO timestamp when countdown ends
  isActive: boolean;
}

// Configuration constants
const SYNC_INTERVAL_MS = 15000; // Sync with backend every 15 seconds
const CLIENT_UPDATE_INTERVAL_MS = 1000; // Update UI every 1 second

export function useCountdown() {
  const [countdownState, setCountdownState] = useState<CountdownState>({
    phase: "starting",
    remainingSeconds: 0,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to track intervals and prevent memory leaks
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);
  const endsAtRef = useRef<Date | null>(null);
  const lastPhaseRef = useRef<string>("starting");

  // Fetch countdown data from backend
  const fetchCountdownStatus = useCallback(async (isInitial = false) => {
    if (fetchingRef.current && !isInitial) return;
    fetchingRef.current = true;

    try {
      setError(null);

      const data = await fetchSingleton<BackendCountdownResponse>(
        getApiEndpoint("/api/countdown"),
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (data.success) {
        const newPhase = data.phase;
        const phaseChanged = lastPhaseRef.current !== newPhase;

        // Update phase tracking
        lastPhaseRef.current = newPhase;

        // Calculate endsAt timestamp if we have remainingSeconds
        let newEndsAt: Date | null = null;
        if (data.endsAt) {
          newEndsAt = new Date(data.endsAt);
        } else if (data.remainingSeconds > 0 && newPhase === "countdown") {
          newEndsAt = new Date(Date.now() + data.remainingSeconds * 1000);
        }

        // Update refs
        endsAtRef.current = newEndsAt;

        // Update state
        setCountdownState({
          phase: newPhase,
          remainingSeconds: data.remainingSeconds,
          isActive: data.isActive,
        });

        // If phase changed, log for debugging
        if (phaseChanged) {
          console.log(
            `🔄 Countdown phase changed: ${lastPhaseRef.current} → ${newPhase}`
          );
        }

        setLoading(false);
      } else {
        throw new Error("Backend returned unsuccessful response");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch countdown status";
      console.error("❌ Error fetching countdown status:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Update countdown locally based on endsAt timestamp
  const updateLocalCountdown = useCallback(() => {
    if (!endsAtRef.current) return;

    const now = Date.now();
    const endsAt = endsAtRef.current.getTime();
    const remainingMs = Math.max(0, endsAt - now);
    const remainingSeconds = Math.floor(remainingMs / 1000);

    // Only update if we're in countdown phase and have time remaining
    if (lastPhaseRef.current === "countdown") {
      setCountdownState((prev) => ({
        ...prev,
        remainingSeconds,
      }));

      // If countdown reached zero, trigger a sync to check for phase change
      if (remainingSeconds <= 0) {
        console.log("⏰ Countdown reached zero, triggering sync...");
        fetchCountdownStatus();
      }
    }
  }, [fetchCountdownStatus]);

  // Setup intervals
  useEffect(() => {
    // Initial fetch
    fetchCountdownStatus(true);

    // Setup sync interval (fetch from backend every 15 seconds)
    syncIntervalRef.current = setInterval(() => {
      fetchCountdownStatus();
    }, SYNC_INTERVAL_MS);

    // Setup client update interval (update UI every 1 second)
    clientIntervalRef.current = setInterval(() => {
      updateLocalCountdown();
    }, CLIENT_UPDATE_INTERVAL_MS);

    // Cleanup function
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      if (clientIntervalRef.current) {
        clearInterval(clientIntervalRef.current);
        clientIntervalRef.current = null;
      }
    };
  }, [fetchCountdownStatus, updateLocalCountdown]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchCountdownStatus();
  }, [fetchCountdownStatus]);

  return {
    phase: countdownState.phase,
    remainingSeconds: countdownState.remainingSeconds,
    isActive: countdownState.isActive,
    loading,
    error,
    refresh,
  };
}
