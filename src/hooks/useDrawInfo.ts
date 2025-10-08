import { useCountdown } from "@/context/CountdownContext";

export function useDrawInfo() {
  const { drawInfo, loading, error } = useCountdown();

  return { drawInfo, loading, error };
}
