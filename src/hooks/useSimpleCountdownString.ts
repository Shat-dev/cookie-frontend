import { useState, useEffect } from "react";

export function useSimpleCountdownString(): string {
  const [timeLeft, setTimeLeft] = useState(3600); // Start with 60 minutes (3600 seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 3600; // Reset to 1 hour when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

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

  return formatTime(timeLeft);
}
