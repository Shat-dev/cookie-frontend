import { useCountdown } from "./useCountdown";

export function useSimpleCountdownString(): string {
  const { phase, remainingSeconds, loading } = useCountdown();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) return "Loading...";

  switch (phase) {
    case "starting":
      return "Starting soon";
    case "countdown":
      return formatTime(remainingSeconds);
    case "selecting":
      return "Selecting Winner";
    case "winner":
      return "Winner Picked!";
    default:
      return "Starting soon";
  }
}
