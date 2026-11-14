"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Horizontaal swipen (telefoon) en pijltjestoetsen (desktop) naar vorig/volgend artikel.
 * Alleen een duidelijk horizontale beweging telt, zodat verticaal scrollen niet stoort.
 */
export function SwipeNav({ prev, next }: { prev: string | null; next: string | null }) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (prev) router.prefetch(prev);
    if (next) router.prefetch(next);

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      // Niet starten vanaf de schermrand: daar zit de terug-gebaar van iOS Safari.
      if (t.clientX < 24 || t.clientX > window.innerWidth - 24) {
        start.current = null;
        return;
      }
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - s.t > 600) return;
      const target = dx < 0 ? next : prev;
      if (target) router.replace(target);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) router.replace(next);
      if (e.key === "ArrowLeft" && prev) router.replace(prev);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [prev, next, router]);

  return null;
}
