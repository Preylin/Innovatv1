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
        "relative grid place-items-center min-h-screen w-screen",
        "bg-[hsla(188.1081081081081,42%,17%,1)]",
        "bg-[radial-gradient(circle_at_-45%_146%,hsla(171.73652694610777,74%,48%,1)_12%,transparent_52%),radial-gradient(circle_at_34%_90%,hsla(171.73652694610777,74%,48%,1)_0%,transparent_71%),radial-gradient(circle_at_36%_95%,hsla(171.71270718232046,73%,48%,1)_7%,transparent_71%),radial-gradient(circle_at_-30%_-28%,hsla(191.42857142857142,47%,17%,1)_7%,transparent_74%)]",
        "bg-no-repeat bg-cover bg-blend-overlay",
      ].join(" ")}
    >
      <div
        className="relative"
        style={{ width: wrapperSize, height: wrapperSize }}
      >
        {modulos.map((mod, i) => {
          const pos = positions[i];
          const img = mod.iconKey && ImagesHome[mod.iconKey];

          return (
            <button
              key={mod.id}
              onClick={() => onModuleClick(mod)}
              className="absolute top-1/2 left-1/2 rounded-full bg-white border shadow-md transition duration-500 hover:scale-105 border-white"
              style={{
                width: childSize,
                height: childSize,
                transform: open
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                  : "translate(-50%, -50%)",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                {img && <img src={img} className="lg:size-14 size-8 
                mx-auto" alt="logos" />}
                <span className="block text-black font-medium text-center text-xs md:text-sm lg:text-base px-4 ">
                  {mod.name}
                </span>
              </div>
            </button>
          );
        })}

        <button
          onClick={onToggle}
          className="absolute top-1/2 left-1/2 rounded-full bg-white shadow-xl transition duration-500 hover:scale-110"
          style={{
            width: mainSize,
            height: mainSize,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center justify-center px-3">
            <img src={logo} alt="Innovat Home" />
          </div>
        </button>
      </div>
    </div>
  );
}
