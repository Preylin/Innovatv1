import { useEffect, useState } from "react";

/**
 * Métricas del menú circular
 */
export type CircularSizes = {
  radius: number;
  mainSize: number;
  childSize: number;
  wrapperSize: number;
};

/**
 * Hook que calcula tamaños responsivos del menú circular
 * basado en el tamaño real de la pantalla.
 */
export function useCircularSizes(): CircularSizes {
  const [sizes, setSizes] = useState<CircularSizes>(() => calculate());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setSizes(calculate());
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return sizes;
}

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Cálculo centralizado y determinista
 */
function calculate(): CircularSizes {
  // SSR / fallback seguro
  if (typeof window === "undefined") {
    return {
      radius: 200,
      mainSize: 180,
      childSize: 120,
      wrapperSize: 500,
    };
  }

  const minScreen = Math.min(window.innerWidth, window.innerHeight);

  // Límites UX-safe
  const radius = clamp(150, Math.round(minScreen * 0.3), 320);

  // Relación geométrica estable
  const mainSize = Math.round(radius * 0.8);
  const childSize = Math.round(radius * 0.65);

  const wrapperSize = Math.max(mainSize, radius * 2 + childSize);

  return { radius, mainSize, childSize, wrapperSize };
}
