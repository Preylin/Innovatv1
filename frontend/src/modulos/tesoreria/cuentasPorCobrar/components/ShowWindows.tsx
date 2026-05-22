import React, { useState, useEffect, useCallback } from "react";
import FloatingWindow from "./WindowBase";

interface WindowState {
  isOpen: boolean;
  x: number;
  y: number;
}

interface Props {
  children: React.ReactNode;
  title: string;
  className?: string;
}


function Dashboard({ children, title, className}: Props) {

  const [windowState, setWindowState] = useState<WindowState | null>(null);

  const WINDOW_WIDTH = 450;
  const WINDOW_HEIGHT = 400;

  // Función para evitar que la ventana quede fuera de la pantalla visible
  const clampPosition = useCallback((x: number, y: number) => {
    const maxX = Math.max(0, window.innerWidth - WINDOW_WIDTH - 20);
    const maxY = Math.max(0, window.innerHeight - WINDOW_HEIGHT - 20);
    return {
      x: x > maxX ? maxX : Math.max(20, x),
      y: y > maxY ? maxY : Math.max(20, y),
    };
  }, []);

  const openToolWindow = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    let initialX = rect.left;
    if (initialX + WINDOW_WIDTH > window.innerWidth) {
      initialX = window.innerWidth - WINDOW_WIDTH - 20;
    }
    const initialY = rect.bottom + 12;

    // Aplicamos los límites de seguridad de una vez
    const safeCoords = clampPosition(initialX, initialY);

    setWindowState({
      isOpen: true,
      x: safeCoords.x,
      y: safeCoords.y,
    });
  };

  // Listener global de resize controlado por el padre
  useEffect(() => {
    if (!windowState?.isOpen) return;

    const handleResize = () => {
      setWindowState((prev) => {
        if (!prev) return null;
        const adjusted = clampPosition(prev.x, prev.y);
        return { ...prev, x: adjusted.x, y: adjusted.y };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowState?.isOpen, clampPosition]);

  return (
    <div className=" bg-slate-100 font-sans">
      <button
        onClick={openToolWindow}
        className={`${className}`}
      >
        {title}
        
      </button>

      {windowState?.isOpen && (
        <FloatingWindow
          x={windowState.x}
          y={windowState.y}
          onPositionChange={(newX, newY) => 
            setWindowState((prev) => prev ? { ...prev, x: newX, y: newY } : null)
          }
          onClose={() => setWindowState(null)}
          title="Resumen"
          children={
            children
          }
        />
      )}
    </div>
  );
};

export default Dashboard;