import { useState, useEffect, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import { createPortal } from "react-dom";
import { IoClose, IoRemove, IoExpand } from "react-icons/io5";
import { useZIndexStore } from "./store";

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FloatingWindowProps {
  children: React.ReactNode;
  titleButtom: React.ReactNode;
  titleWindow: string;
  widthWindow?: number;
  heightWindow?: number;
  storageKey?: string;
  snapGrid?: [number, number];
  lockAspectRatio?: number | boolean;
  enableResizing?: boolean | Record<string, boolean>;
  minimizable?: boolean;
  maximizable?: boolean;
}

export function FloatingWindowButton({
  children,
  titleButtom,
  titleWindow,
  widthWindow = 450,
  heightWindow = 400,
  storageKey = "floating-window",
  snapGrid = [1, 1],
  lockAspectRatio,
  enableResizing = true,
  minimizable = true,
  maximizable = true,
}: FloatingWindowProps) {
  const bringToFrontGlobal = useZIndexStore((s: { bringToFront: any; }) => s.bringToFront);
  const [windowState, setWindowState] = useState<WindowState | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [lastWindowState, setLastWindowState] = useState<WindowState | null>(null);
  const [zIndex, setZIndex] = useState(100);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState<WindowState | null>(null);
  const windowStateRef = useRef(windowState);

  useEffect(() => {
    windowStateRef.current = windowState;
  }, [windowState]);

  // Persistencia automática
  useEffect(() => {
    if (windowState && !isMinimized) {
      localStorage.setItem(storageKey, JSON.stringify(windowState));
    } else if (!windowState) {
      localStorage.removeItem(storageKey);
    }
  }, [windowState, storageKey, isMinimized]);

  const clampPosition = useCallback((x: number, y: number, width: number, height: number) => {
    const maxX = Math.max(0, window.innerWidth - width - 20);
    const maxY = Math.max(0, window.innerHeight - height - 20);
    return {
      x: x > maxX ? maxX : Math.max(20, x),
      y: y > maxY ? maxY : Math.max(20, y),
    };
  }, []);

  const bringToFront = useCallback(() => {
    setZIndex(bringToFrontGlobal());
  }, [bringToFrontGlobal]);

 const toggleWindow = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (windowState) {
        closeWindow();
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const initialX = lastWindowState ? lastWindowState.x : rect.left;
      const initialY = lastWindowState ? lastWindowState.y : rect.bottom + 12;
      const w = lastWindowState ? lastWindowState.width : widthWindow;
      const h = lastWindowState ? lastWindowState.height : heightWindow;

      const safeCoords = clampPosition(initialX, initialY, w, h);
      setWindowState({
        x: safeCoords.x,
        y: safeCoords.y,
        width: w,
        height: h,
      });
      bringToFront();
    },
    [windowState, lastWindowState, clampPosition, widthWindow, heightWindow, bringToFront]
  );


  const closeWindow = () => {
    if (windowState) setLastWindowState(windowState);
    setWindowState(null);
    setIsMinimized(false);
    setIsMaximized(false);
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  const toggleMaximize = () => {
    if (isMaximized) {
      if (preMaxState) setWindowState(preMaxState);
      setIsMaximized(false);
    } else {
      setPreMaxState(windowState);
      setWindowState({
        x: 20,
        y: 20,
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
      });
      setIsMaximized(true);
    }
  };

  // Resize listener optimizado
  useEffect(() => {
    const handleResize = () => {
      const current = windowStateRef.current;
      if (!current || isMaximized) return;
      const adjusted = clampPosition(current.x, current.y, current.width, current.height);
      if (adjusted.x !== current.x || adjusted.y !== current.y) {
        setWindowState((prev) => (prev ? { ...prev, x: adjusted.x, y: adjusted.y } : null));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clampPosition, isMaximized]);

  return (
    <>
      <button
        onClick={toggleWindow}
        aria-expanded={!!windowState}
        aria-haspopup="dialog"
        className="..."
      >
        {titleButtom}
      </button>

      {windowState &&
        createPortal(
          <Rnd
            position={{ x: windowState.x, y: windowState.y }}
            size={
              isMaximized
                ? { width: window.innerWidth - 40, height: window.innerHeight - 40 }
                : { width: windowState.width, height: isMinimized ? 48 : windowState.height }
            }
            minWidth={isMinimized ? 250 : 320}
            minHeight={isMinimized ? 48 : 250}
            bounds="window"
            dragHandleClassName="window-drag-handle"
            dragGrid={snapGrid}
            resizeGrid={snapGrid}
            lockAspectRatio={isMaximized ? false : lockAspectRatio}
            enableResizing={isMinimized || isMaximized ? false : enableResizing}
            disableDragging={isMaximized}
            onMouseDown={bringToFront}
            onDragStart={bringToFront}
            onDragStop={(_, d) => {
              if (!isMaximized) {
                setWindowState((prev) => (prev ? { ...prev, x: d.x, y: d.y } : null));
              }
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              if (!isMaximized && !isMinimized) {
                setWindowState({
                  x: position.x,
                  y: position.y,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                });
              }
            }}
            className="flex flex-col shadow-2xl bg-mist-50 rounded-md overflow-hidden"
            style={{ zIndex }}
            role="dialog"
            aria-label={titleWindow}
          >
            {/* Barra de título */}
            <div className="window-drag-handle flex items-center justify-between p-3 bg-slate-900 text-white select-none">
              <div className="flex items-center gap-2">
                {/* Íconos decorativos */}
                <span className="text-xs font-bold tracking-tight uppercase">
                  {titleWindow}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {minimizable && (
                  <button onClick={toggleMinimize} aria-label="Minimizar" className="hover:text-gray-300">
                    <IoRemove fontSize={18} />
                  </button>
                )}
                {maximizable && (
                  <button onClick={toggleMaximize} aria-label="Maximizar" className="hover:text-gray-300">
                    <IoExpand fontSize={14} />
                  </button>
                )}
                <button onClick={closeWindow} aria-label="Cerrar" className="hover:text-red-500">
                  <IoClose fontSize={20} />
                </button>
              </div>
            </div>
            {/* Contenido */}
            {!isMinimized && <div className="flex-1 overflow-auto">{children}</div>}
          </Rnd>,
          document.body,
        )}
    </>
  );
}