import { useEffect, useState } from "react";

export type CircularSizes = {
  radius: number;
  mainSize: number;
  childSize: number;
  wrapperSize: number;
};

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

function calculate(): CircularSizes {
  if (typeof window === "undefined") {
    return { radius: 120, mainSize: 100, childSize: 80, wrapperSize: 350 };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  // Usamos el menor de los dos para asegurar que el círculo quepa verticalmente también
  const viewportMin = Math.min(width, height);

  let radius: number;
  let mainSize: number;
  let childSize: number;

  if (width >= 768) { 
    // DESKTOP (lg: 1024px+)
    radius = viewportMin * 0.31; // 35% del viewport
    mainSize = radius * 0.80;    
    childSize = radius * 0.55;
  } else if (width >= 414) { 
    // TABLET (md: 768px+)
    radius = viewportMin * 0.30;
    mainSize = radius * 0.75;
    childSize = radius * 0.50;
  } else {
    // MOBILE (base)
    radius = viewportMin * 0.29;
    mainSize = radius * 0.90;
    childSize = radius * 0.65;
  }

  // CORRECCIÓN CRÍTICA: El wrapper debe ser el diámetro (radius * 2) 
  // más el tamaño completo de un hijo para que no se desborde al estar en los extremos.
  const wrapperSize = (radius * 2) + childSize + 40; 

  return { radius, mainSize, childSize, wrapperSize };
}