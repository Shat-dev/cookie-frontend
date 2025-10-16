import { useState, useEffect, useRef } from "react";
import { getApiEndpoint } from "@/utils/api";

// Define proper types for automation data
interface AutomationData {
  isEnabled: boolean;
  hasActiveDraw: boolean;
  isCompleted?: boolean;
  round?: number;
  totalEntries?: number;
  message?: string;
}

// Define proper types for round data
interface RoundData {
  round?: number;
  status?: string;
  entries?: number;
  winner?: string;
  timestamp?: number;
  [key: string]: unknown; // Allow for additional properties
}

// Enhanced cache system with invalidation capabilities
interface CacheEntry {
  drawNumber: number;
  timestamp: number;
  cacheKey?: string;
  automation?: AutomationData;
  roundData?: RoundData;
}

// ✅ NEW: Notification system for important state changes
interface DrawNotification {
  type: "round_completed" | "round_started" | "vrf_pending" | "entry_change";
  message: string;
  timestamp: number;
}

let cachedData: CacheEntry | null = null;
const CACHE_DURATION = 15000; // 15 seconds for faster updates

// ✅ NEW: Notification listeners
const notificationListeners = new Set<
  (notification: DrawNotification) => void
>();

// Global cache invalidation function
export const invalidateDrawCache = () => {
  cachedData = null;
  console.log("🔄 Draw cache invalidated");
};

// ✅ NEW: Subscribe to notifications
export const subscribeToDrawNotifications = (
  listener: (notification: DrawNotification) => void
) => {
  notificationListeners.add(listener);
  return () => notificationListeners.delete(listener);
};

// ✅ NEW: Emit notifications to all listeners
const emitNotification = (notification: DrawNotification) => {
  notificationListeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (error) {
      console.warn("Notification listener error:", error);
    }
  });
};

// Check if cache should be invalidated based on cacheKey
const shouldInvalidateCache = (newCacheKey?: string): boolean => {
  if (!cachedData || !newCacheKey) return false;
  return cachedData.cacheKey !== newCacheKey;
};

// ✅ NEW: Detect important state changes and emit notifications
const detectStateChanges = (
  oldData: CacheEntry | null,
  newData: CacheEntry
) => {
  if (!oldData) return; // Skip notification on first load

  // Round completion
  if (!oldData.automation?.isCompleted && newData.automation?.isCompleted) {
    emitNotification({
      type: "round_completed",
      message: `Round ${newData.automation.round} completed! Winner selected.`,
      timestamp: Date.now(),
    });
  }

  // New round started
  if (
    oldData.drawNumber !== newData.drawNumber &&
    newData.automation?.hasActiveDraw
  ) {
    emitNotification({
      type: "round_started",
      message: `Round ${newData.drawNumber} has started!`,
      timestamp: Date.now(),
    });
  }

  // VRF pending (round ended but not completed)
  if (
    oldData.automation?.hasActiveDraw &&
    !newData.automation?.hasActiveDraw &&
    !newData.automation?.isCompleted
  ) {
    emitNotification({
      type: "vrf_pending",
      message: `Round ${oldData.automation.round} ended - awaiting winner selection...`,
      timestamp: Date.now(),
    });
  }

  // Significant entry count changes (more than 10% or more than 5 entries)
  const oldEntries = oldData.automation?.totalEntries || 0;
  const newEntries = newData.automation?.totalEntries || 0;
  const entryDiff = Math.abs(newEntries - oldEntries);

  if (entryDiff > 5 || (oldEntries > 0 && entryDiff / oldEntries > 0.1)) {
    emitNotification({
      type: "entry_change",
      message: `Entry count changed: ${oldEntries} → ${newEntries}`,
      timestamp: Date.now(),
    });
  }
};

export const useCurrentDraw = () => {
  const [drawNumber, setDrawNumber] = useState<number | null>(
    cachedData?.drawNumber || null
  );
  const [loading, setLoading] = useState(!cachedData);
  const [automation, setAutomation] = useState<AutomationData | null>(
    cachedData?.automation || null
  );
  const [roundData, setRoundData] = useState<RoundData | null>(
    cachedData?.roundData || null
  );
  const fetchingRef = useRef(false);

  const fetchDrawNumber = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await fetch(
        getApiEndpoint("/api/lottery/current-draw"),
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

      if (result.success && result.data) {
        const newDrawNumber = result.data.drawNumber || 1;
        const newAutomation = {
          isEnabled: true,
          hasActiveDraw: true,
          totalEntries: 0, // Will be updated from projections
        };
        const newRoundData = result.data.roundData;

        // Store old data for change detection
        const oldData = cachedData;

        // Update cache
        cachedData = {
          drawNumber: newDrawNumber,
          timestamp: Date.now(),
          automation: newAutomation,
          roundData: newRoundData,
        };

        // ✅ NEW: Detect and emit notifications for state changes
        detectStateChanges(oldData, cachedData);

        setDrawNumber(newDrawNumber);
        setAutomation(newAutomation);
        setRoundData(newRoundData);
        setLoading(false);

        return newDrawNumber;
      } else {
        throw new Error(result.error || "Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching unified status:", error);

      // If we have no cached value, set a reasonable fallback
      if (!cachedData) {
        const fallbackData = {
          drawNumber: 1,
          timestamp: Date.now(),
          automation: {
            isEnabled: false,
            hasActiveDraw: false,
            message: "Service unavailable",
          },
          roundData: undefined,
        };

        cachedData = fallbackData;
        setDrawNumber(1);
        setAutomation(fallbackData.automation);
        setRoundData(null);
      }
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    // If we have fresh cached data, use it immediately
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setDrawNumber(cachedData.drawNumber);
      setAutomation(cachedData.automation || null);
      setRoundData(cachedData.roundData || null);
      setLoading(false);
      return;
    }

    // Otherwise fetch fresh data
    fetchDrawNumber();

    // Set up more frequent refresh for real-time updates
    const interval = setInterval(() => {
      if (!cachedData || Date.now() - cachedData.timestamp > CACHE_DURATION) {
        fetchDrawNumber();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    drawNumber: drawNumber || 1, // Always return at least 1
    loading,
    automation,
    roundData,
    refetch: fetchDrawNumber,
    invalidateCache: invalidateDrawCache,
  };
};
