// useCircularLayout.ts
import { useMemo } from "react";
import type { Modulo } from "./types";

export function useCircularLayout(
  modulos: readonly Modulo[],
  radius: number
): { x: number; y: number }[] {
  return useMemo(() => {
    const items = modulos.length;
    if (items === 0) return [];

    return modulos.map((_, i) => {
      const angle = (Math.PI * 2 * i) / items - Math.PI / 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, [modulos, radius]);
}
