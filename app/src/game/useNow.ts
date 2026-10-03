import { useEffect, useState } from 'react';

/**
 * The time, for render-time reads like "how well does the player know this
 * word right now". Memory decays over days, so a clock that ticks every
 * half minute is plenty, and it keeps renders pure.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}
