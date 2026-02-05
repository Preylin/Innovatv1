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
        className="relative flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          width: wrapperSize,
          height: wrapperSize,
          transform: open ? "scale(1)" : "scale(0.9)",
          // Evita que el scroll del móvil interfiera al tocar el menú
          touchAction: "none" 
        }}
      >
        {modulos.map((mod, i) => {
          const pos = positions[i];
          const img = mod.iconKey && ImagesHome[mod.iconKey];

          return (
            <button
              key={mod.id}
              onClick={() => onModuleClick(mod)}
              className={`absolute top-1/2 left-1/2 rounded-full bg-white shadow-xl 
                        transition-all duration-500 flex flex-col items-center justify-center
                      hover:bg-emerald-50 active:scale-95 group border-2 border-transparent hover:border-emerald-200`}
              style={{
                width: childSize,
                height: childSize,
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                transform: open
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                  : "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <div className="flex flex-col items-center justify-center p-2">
                {img && (
                  <img
                    src={img}
                    className="w-1/2 h-auto mb-2 transition-transform group-hover:scale-110"
                    alt={mod.name}
                  />
                )}
                <span className="text-[7px] sm:text-[10px] lg:text-[11px] px-2 font-bold text-slate-700 uppercase tracking-tighter leading-none">
                  {mod.name}
                </span>
              </div>
            </button>
          );
        })}

        {/* Botón Central */}
        <button
          onClick={onToggle}
          className="absolute top-1/2 left-1/2 z-20 rounded-full bg-white shadow-[0_0_30px_rgba(0,0,0,0.2)] 
                     transition-transform duration-300 active:scale-90 flex items-center justify-center overflow-hidden"
          style={{
            width: mainSize,
            height: mainSize,
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            className="w-3/4 h-auto object-contain transition-transform duration-500"
            style={{ transform: open ? "scale(0.85)" : "scale(1)" }}
          />
        </button>
      </div>
    </div>
  );
}




