import { useCountdown } from "@/context/CountdownContext";

export function useCountdownString(): string {
  const { timeLeft, loading, error } = useCountdown();

  if (loading) return "Loading...";
  if (error) return "--:--";

  // Convert "Drawing..." to "Drawing now!" for consistency
  if (timeLeft === "Drawing...") return "Drawing now!";

  return timeLeft;
}
