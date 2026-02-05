import { useState, useEffect, useMemo } from "react";

export function useCircularSizes() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Usamos un timeout sencillo para evitar cálculos en cada píxel de resize
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return useMemo(() => {
    const { width, height } = windowSize;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    
    // Usamos el lado más corto para asegurar que el círculo quepa
    const viewportMin = Math.min(width, height);

    let radius: number;
    let mainSize: number;
    let childSize: number;

    if (isMobile) {
      // En móvil: Radio más pequeño para no chocar con bordes, botones más grandes para dedos
      radius = viewportMin * 0.35; 
      mainSize = radius * 0.90;
      childSize = radius * 0.60; // Botones táctiles fáciles de presionar
    } else if (isTablet) {
      radius = viewportMin * 0.30;
      mainSize = radius * 0.70;
      childSize = radius * 0.50;
    } else {
      // Desktop
      radius = viewportMin * 0.35;
      mainSize = radius * 0.75;
      childSize = radius * 0.50;
    }

    // El wrapper debe contener el radio + la mitad del botón hijo para no cortarse
    const wrapperSize = (radius * 2) + childSize;

    return { radius, mainSize, childSize, wrapperSize, isMobile };
  }, [windowSize]);
}