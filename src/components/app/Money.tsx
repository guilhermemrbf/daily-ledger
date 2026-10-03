import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Animated BRL value (tweens between integer cent values). */
export function Money({ cents, sign, className }: { cents: number; sign?: boolean; className?: string }) {
  const [shown, setShown] = useState(cents);
  const from = useRef(cents);
  useEffect(() => {
    const start = from.current;
    if (start === cents) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 420);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (cents - start) * e));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = cents;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = cents;
    };
  }, [cents]);
  return <span className={cn("num", className)}>{formatBRL(shown, { sign })}</span>;
}
