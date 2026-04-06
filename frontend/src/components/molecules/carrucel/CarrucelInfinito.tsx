import { useMemo, type FC, type ReactNode } from "react";

interface InfiniteCarouselProps {
  children: ReactNode;
  speed?: number; // Segundos por ciclo
  pauseOnHover?: boolean;
  gap?: number; // Espacio entre elementos en px
  height?: string | number; // Altura del contenedor visible
}

const InfiniteCarousel: FC<InfiniteCarouselProps> = ({
  children,
  speed = 20,
  pauseOnHover = true,
  gap = 4,
  height = "500px",
}) => {
  // Memorizamos el estilo para manejar variables CSS dinámicas
  const containerStyle = useMemo(() => ({
    "--duration": `${speed}s`,
    "--gap": `${gap}px`,
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap)",
    height: "max-content",
  } as React.CSSProperties), [speed, gap]);

  return (
    <div 
      className="relative w-full overflow-hidden" 
      style={{ height }} // El contenedor padre debe tener una altura fija o definida
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-vertical {
          0% { transform: translateY(calc(-50% - (var(--gap) / 2))); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-vertical {
          animation: scroll-vertical var(--duration) linear infinite;
        }
        .pause-hover:hover {
          animation-play-state: paused;
        }
      `}} />

      <div 
        className={`animate-scroll-vertical ${pauseOnHover ? 'pause-hover' : ''}`}
        style={containerStyle}
      >
        {/* Bloque 1 */}
        <div className="flex flex-col items-center gap-(--gap) shrink-0">
          {children}
        </div>
        
        {/* Duplicado para efecto infinito */}
        <div className="flex flex-col items-center gap-(--gap) shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>

      {/* Opcional: Gradientes para suavizar la entrada/salida (Filtro visual) */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white via-transparent to-white opacity-20" />
    </div>
  );
};

export default InfiniteCarousel;