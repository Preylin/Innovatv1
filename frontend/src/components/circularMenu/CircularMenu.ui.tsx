import type { Modulo } from "./types";
import { ImagesHome, logo } from "../../assets/images";

type Props = {
  modulos: Modulo[];
  positions: { x: number; y: number }[];
  open: boolean;
  mainSize: number;
  childSize: number;
  wrapperSize: number;
  onToggle(): void;
  onModuleClick(m: Modulo): void;
};

export function CircularMenuUI({
  modulos,
  positions,
  open,
  mainSize,
  childSize,
  wrapperSize,
  onToggle,
  onModuleClick,
}: Props) {
  return (
    <div
      className={[
        "relative w-full h-screen overflow-hidden flex items-center justify-center",
        "bg-[hsla(188.1081081081081,42%,17%,1)]",
        "bg-[radial-gradient(circle_at_-45%_146%,hsla(171.73652694610777,74%,48%,1)_12%,transparent_52%),radial-gradient(circle_at_34%_90%,hsla(171.73652694610777,74%,48%,1)_0%,transparent_71%),radial-gradient(circle_at_36%_95%,hsla(171.71270718232046,73%,48%,1)_7%,transparent_71%),radial-gradient(circle_at_-30%_-28%,hsla(191.42857142857142,47%,17%,1)_7%,transparent_74%)]",
        "bg-no-repeat bg-cover bg-blend-overlay",
      ].join(" ")}
    >
      <div
        className="relative flex itmes-center justify-center transition-transform duration-500 ease-out"
        style={{ 
          width: wrapperSize, 
          height: wrapperSize,
          transform: `scale(${open ? 1 : 0.85})` 
        }}
      >
        {modulos.map((mod, i) => {
          const pos = positions[i];
          const img = mod.iconKey && ImagesHome[mod.iconKey];

          return (
            <button
              key={mod.id}
              onClick={() => onModuleClick(mod)}
              className="absolute top-1/2 left-1/2 rounded-full bg-white border shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 border-white overflow-hidden flex flex-col items-center justify-center"
              style={{
                width: childSize,
                height: childSize,
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                transform: open
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                  : "translate(-50%, -50%)",
                zIndex: open ? 10 : 0,
              }}
            >
              {/* Contenedor de contenido con padding responsivo */}
              <div className="flex flex-col items-center justify-center w-full h-full p-[10%]">
                {img && (
                  <img 
                    src={img} 
                    className="w-[45%] h-auto mb-1" 
                    alt={mod.name} 
                  />
                )}
                <span className="text-[calc(7px+0.5vw)] md:text-[calc(10px+0.3vw)] font-bold text-slate-800 text-center leading-tight wrap-break-words w-full">
                  {mod.name}
                </span>
              </div>
            </button>
          );
        })}

        <button
          onClick={onToggle}
          className="absolute top-1/2 left-1/2 z-20 rounded-full bg-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-90 flex items-center justify-center p-4 overflow-hidden"
          style={{
            width: mainSize,
            height: mainSize,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-full h-auto flex items-center justify-center">
            <img 
              src={logo} 
              alt="Logo" 
              className="max-w-[95%] h-auto object-contain"
              style={{ transform: open ? 'scale(0.9)' : 'scale(1)' }}
            />
          </div>
        </button>
      </div>
    </div>
  );
}