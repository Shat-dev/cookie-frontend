"use client";

import { useCountdown } from "@/context/CountdownContext";

const CountdownTimer: React.FC = () => {
  const { timeLeft, loading, error } = useCountdown();

  if (loading) {
    return (
      <span className="tracking-widest font-mono text-[#212427]">
        Loading...
      </span>
    );
  }

  if (error) {
    return (
      <span className="tracking-widest font-mono text-[#212427]">{error}</span>
    );
  }

  const isPending =
    timeLeft === "Round pending" ||
    timeLeft === "Round starting" ||
    timeLeft === "awaiting winner..." ||
    timeLeft === "drawing..." ||
    timeLeft === "Winner chosen!" ||
    timeLeft.startsWith("Freezing…") ||
    timeLeft.startsWith("Frozen");

  const isAwaitingVRF =
    timeLeft === "awaiting winner..." || timeLeft === "drawing...";

  return (
    <span
      className={`tracking-widest font-mono text-[#212427] ${
        isPending ? "animate-pulse" : ""
      } ${isAwaitingVRF ? "breathing" : ""}`}
    >
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;
