import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";


interface FloatingWindowProps {
  x: number;
  y: number;
  onPositionChange: (x: number, y: number) => void;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}

function FloatingWindow({
  x,
  y,
  onPositionChange,
  onClose,
  children,
  title
}: FloatingWindowProps) {
  const [zIndex, setZIndex] = useState(100);

  return createPortal(
    <Rnd
      // Sincronizado directamente con las props que envía el padre
      position={{ x, y }}
      size={{ width: 450, height: 400 }}
      minWidth={320}
      minHeight={250}
      bounds="window"
      dragHandleClassName="window-drag-handle"
      onDragStart={() => setZIndex((prev) => prev + 1)}
      // Cuando el usuario termina de arrastrar, actualiza el estado del Padre
      onDragStop={(_, d) => {
        onPositionChange(d.x, d.y);
      }}
      className="flex flex-col shadow-2xl bg-mist-50 rounded-md overflow-hidden"
      style={{ zIndex }}
    >
      {/* HEADER / DRAG HANDLE */}
      <div className="window-drag-handle flex items-center justify-between px-3 py-2 bg-slate-900 text-white cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-row gap-1 items-center">
            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
          </div>
          <span className="text-xs font-bold tracking-tight uppercase">
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="hover:text-red-500 transition-colors duration-200"
        >
          <IoClose />
        </button>
      </div>
      {children}
    </Rnd>,
    document.body
  );
};

export default FloatingWindow;