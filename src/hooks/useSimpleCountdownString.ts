import { useState, useEffect } from "react";

interface CountdownState {
  phase: "starting" | "countdown" | "selecting" | "winner";
  remainingSeconds: number;
  isActive: boolean;
}

export function useSimpleCountdownString(): string {
  const [countdownState, setCountdownState] = useState<CountdownState>({
    phase: "starting",
    remainingSeconds: 0,
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCountdownStatus = async () => {
    try {
      const response = await fetch("/api/lottery/countdown");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCountdownState({
            phase: data.phase,
            remainingSeconds: data.remainingSeconds,
            isActive: data.isActive,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching countdown status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCountdownStatus();

    // Set up polling every second
    const interval = setInterval(fetchCountdownStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  if (isLoading) return "Loading...";

  switch (countdownState.phase) {
    case "starting":
      return "Starting soon";
    case "countdown":
      return formatTime(countdownState.remainingSeconds);
    case "selecting":
      return "Selecting Winner";
    case "winner":
      return "Winner Picked!";
    default:
      return "Starting soon";
  }
}
