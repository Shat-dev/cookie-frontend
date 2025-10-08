"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getApiEndpoint } from "@/utils/api";

const FREEZE_SEC = Number(process.env.NEXT_PUBLIC_FREEZE_SEC || 180);
const WINNER_HOLD_MS = Number(process.env.NEXT_PUBLIC_WINNER_HOLD_MS || 15000);

interface DrawInfo {
  hasActiveDraw: boolean;
  round?: number;
  drawTime?: number; // UNIX seconds: round end
  freezeTime?: number; // UNIX seconds: end - FREEZE_SEC
  secondsRemaining?: number;
  totalEntries?: number;
  automationEnabled?: boolean;
  isFrozen?: boolean;
  isCompleted?: boolean; // optional
  message?: string;
  drawNumber?: number; // Added for unified endpoint
  roundState?: {
    // Added for unified endpoint
    isActive: boolean;
    start: number;
    end: number;
    winner: string;
    winningTokenId: string;
  } | null;
}

interface CountdownContextType {
  timeLeft: string;
  loading: boolean;
  error: string;
  drawInfo: DrawInfo | null;
}

const CountdownContext = createContext<CountdownContextType | undefined>(
  undefined
);

export const CountdownProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawInfo, setDrawInfo] = useState<DrawInfo | null>(null);

  const fetchDrawInfo = async (): Promise<DrawInfo | null> => {
    try {
      if (typeof window === "undefined") return null;
      // ✅ NEW: Use unified endpoint for better synchronization
      const endpoint = getApiEndpoint("/api/automation/unified-status");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(endpoint, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "API unsuccessful");

      // ✅ NEW: Transform unified response to DrawInfo format
      const unifiedData = json.data;
      const automation = unifiedData.automation;
      const roundData = unifiedData.roundData;

      // Convert to DrawInfo format for compatibility
      const drawInfo: DrawInfo = {
        drawNumber: unifiedData.drawNumber || 1,
        hasActiveDraw: automation?.hasActiveDraw || false,
        drawTime: automation?.drawTime || null,
        freezeTime: automation?.freezeTime || null,
        totalEntries: automation?.totalEntries || 0,
        isCompleted: automation?.isCompleted || false,
        round: automation?.round || unifiedData.currentRound || 0,

        // Additional automation-specific data
        automationEnabled: automation?.isEnabled || false,
        roundState: roundData
          ? {
              isActive: roundData.isActive,
              start: roundData.start,
              end: roundData.end,
              winner: roundData.winner,
              winningTokenId: roundData.winningTokenId,
            }
          : null,
      };

      return drawInfo;
    } catch (err) {
      console.error("❌ Error fetching unified draw info:", err);
      return null;
    }
  };

  useEffect(() => {
    let lastFetchTime = 0;
    let cached: DrawInfo | null = null;
    let winnerHoldUntil = 0; // hold “Winner chosen!” briefly after completion

    const fetchData = async () => {
      const d = await fetchDrawInfo();
      if (!d) {
        setError("Please wait");
        setLoading(false);
        return;
      }
      cached = d;
      setDrawInfo(d);
      setError("");
      setLoading(false);
      lastFetchTime = Date.now();

      if (d.isCompleted) {
        winnerHoldUntil = Date.now() + WINNER_HOLD_MS;
      }
    };

    const fmt = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
    };

    const updateCountdown = () => {
      if (!cached) {
        setTimeLeft("Loading...");
        return;
      }

      // Keep “Winner chosen!” visible even if next round already started
      if (winnerHoldUntil > Date.now()) {
        setTimeLeft("Winner chosen!");
        return;
      }

      const now = Math.floor(Date.now() / 1000);

      // No active draw yet
      if (!cached.hasActiveDraw) {
        setTimeLeft("Round starting");
        return;
      }

      const end = cached.drawTime ?? 0;
      const freezeAt = cached.freezeTime ?? (end ? end - FREEZE_SEC : 0);
      const secsToFreeze = Math.max(0, freezeAt > 0 ? freezeAt - now : 0);
      const secsToEnd = Math.max(0, end > 0 ? end - now : 0);

      // After end → Automation/VRF
      if (end > 0 && now >= end) {
        if (cached.isCompleted) {
          setTimeLeft("Winner chosen!");
          if (winnerHoldUntil === 0) {
            winnerHoldUntil = Date.now() + WINNER_HOLD_MS;
          }
        } else {
          setTimeLeft("awaiting winner...");
        }
        if (Date.now() - lastFetchTime > 2000) void fetchData();
        return;
      }

      // Freeze window
      if (freezeAt > 0 && now >= freezeAt && now < end) {
        setTimeLeft("drawing...");
        return;
      }

      // Pre-freeze countdown
      if (end > 0 && now < freezeAt) {
        setTimeLeft(fmt(secsToFreeze)); // mm:ss
        return;
      }

      // Fallback
      setTimeLeft(secsToEnd > 0 ? fmt(secsToEnd) : "Round pending");
    };

    void fetchData();
    const dataFetchInterval = setInterval(fetchData, 30_000);
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(dataFetchInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <CountdownContext.Provider value={{ timeLeft, loading, error, drawInfo }}>
      {children}
    </CountdownContext.Provider>
  );
};

export const useCountdown = (): CountdownContextType => {
  const ctx = useContext(CountdownContext);
  if (!ctx)
    throw new Error("useCountdown must be used within a CountdownProvider");
  return ctx;
};
