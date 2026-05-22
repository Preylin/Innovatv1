import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

interface WindowState {
  x: number;
  y: number;
  width: number;  // Guardamos el ancho dinámico aquí
  height: number; // Guardamos el alto dinámico aquí
}

interface Props {
  children: ReactNode;
  titleButtom: ReactNode;
  titleWindow: string;
  widthWindow?: number;
  heightWindow?: number;
}

export function FloatingWindowButton({
  children,
  titleButtom,
  titleWindow,
  widthWindow = 450,
  heightWindow = 400,
}: Props) {
  const [windowState, setWindowState] = useState<WindowState | null>(null);
  const [zIndex, setZIndex] = useState(100);

  // Función para forzar que la ventana se mantenga dentro del viewport visible basándose en su tamaño actual
  const clampPosition = useCallback((x: number, y: number, width: number, height: number) => {
    const maxX = Math.max(0, window.innerWidth - width - 20);
    const maxY = Math.max(0, window.innerHeight - height - 20);
    return {
      x: x > maxX ? maxX : Math.max(20, x),
      y: y > maxY ? maxY : Math.max(20, y),
    };
  }, []);

  // Manejador del click para abrir/posicionar la ventana abajo del botón
  const toggleWindow = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (windowState) {
      setWindowState(null); // Si ya está abierta, la cierra
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    let initialX = rect.left;
    if (initialX + widthWindow > window.innerWidth) {
      initialX = window.innerWidth - widthWindow - 20;
    }
    const initialY = rect.bottom + 12;

    // Inicializamos el estado con las coordenadas calculadas y los tamaños por defecto
    const safeCoords = clampPosition(initialX, initialY, widthWindow, heightWindow);
    setWindowState({ 
      x: safeCoords.x, 
      y: safeCoords.y, 
      width: widthWindow, 
      height: heightWindow 
    });
  };

  // Listener para recalcular la posición si cambia el tamaño de pantalla (responsive)
  useEffect(() => {
    if (!windowState) return;

    const handleResize = () => {
      setWindowState((prev) => {
        if (!prev) return null;
        // Pasamos las dimensiones actuales guardadas en el estado
        const adjusted = clampPosition(prev.x, prev.y, prev.width, prev.height);
        return { ...prev, x: adjusted.x, y: adjusted.y };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowState, clampPosition]);

  return (
    <>
      {/* EL BOTÓN DISPARADOR */}
      <button
        onClick={toggleWindow}
        className="shadow bg-mist-800 text-mist-50 px-2 py-1 rounded-md cursor-pointer hover:bg-mist-600 transition-colors duration-200"
      >
        {titleButtom}
      </button>

      {/* LA VENTANA FLOTANTE */}
      {windowState &&
        createPortal(
          <Rnd
            // Ahora tanto la posición como el tamaño leen del estado reactivo dinámico
            position={{ x: windowState.x, y: windowState.y }}
            size={{ width: windowState.width, height: windowState.height }}
            minWidth={320}
            minHeight={250}
            bounds="window"
            dragHandleClassName="window-drag-handle"
            onDragStart={() => setZIndex((prev) => prev + 1)}
            // Al arrastrar, preservamos el tamaño actual y cambiamos X e Y
            onDragStop={(_, d) => {
              setWindowState((prev) => prev ? { ...prev, x: d.x, y: d.y } : null);
            }}
            // ¡NUEVO! Al redimensionar, guardamos el nuevo ancho y alto que eligió el usuario
            onResizeStop={(_, __, ref, ___, position) => {
              setWindowState({
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              });
            }}
            className="flex flex-col shadow-2xl bg-mist-50 rounded-md overflow-hidden"
            style={{ zIndex }}
          >
            <div className="window-drag-handle flex items-center justify-between p-3 bg-slate-900 text-white cursor-move select-none">
              <div className="flex items-center gap-2">
                <div className="flex flex-row gap-1 items-center">
                  <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                </div>
                <span className="text-xs font-bold tracking-tight uppercase">
                  {titleWindow}
                </span>
              </div>
              <button
                onClick={() => setWindowState(null)}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <IoClose fontSize={20} />
              </button>
            </div>
            {children}
          </Rnd>,
          document.body,
        )}
    </>
  );
}

export default FloatingWindowButton;