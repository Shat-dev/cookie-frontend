"use client";

import { useCountdown } from "@/hooks/useCountdown";

const SimpleCountdown: React.FC = () => {
  const { phase, remainingSeconds, loading } = useCountdown();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getDisplayText = () => {
    if (loading) return "Loading...";

    switch (phase) {
      case "starting":
        return "Starting soon";
      case "countdown":
        return formatTime(remainingSeconds);
      case "selecting":
        return "Selecting...";
      case "winner":
        return "Winner Picked!";
      case "new_round":
        return "Next round";
      default:
        return "Starting soon";
    }
  };

  const shouldAnimate = () => {
    return (
      phase === "starting" || phase === "selecting" || phase === "new_round"
    );
  };

  return (
    <span
      className={`tracking-widest font-mono text-[#212427] ${
        shouldAnimate() ? "animate-pulse" : ""
      }`}
    >
      {getDisplayText()}
    </span>
  );
};

export default SimpleCountdown;
