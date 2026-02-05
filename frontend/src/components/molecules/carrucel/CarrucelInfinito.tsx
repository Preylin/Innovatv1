import { useMemo, type FC, type ReactNode } from "react";

interface InfiniteCarouselProps {
  children: ReactNode;
  speed?: number; // Segundos por ciclo
  pauseOnHover?: boolean;
  gap?: number; // Espacio entre elementos en px
}

const InfiniteCarousel: FC<InfiniteCarouselProps> = ({
  children,
  speed = 20,
  pauseOnHover = true,
  gap = 32,
}) => {
  // Memorizamos el estilo para evitar cálculos innecesarios
  const containerStyle = useMemo(() => ({
    "--duration": `${speed}s`,
    "--gap": `${gap}px`,
    display: "flex",
    width: "max-content",
    gap: "var(--gap)",
  } as React.CSSProperties), [speed, gap]);

  return (
    <div className="relative w-full overflow-hidden py-1">
      {/* Inyectamos los keyframes una sola vez de forma más eficiente */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - (var(--gap) / 2))); }
        }
        .animate-scroll {
          animation: scroll-infinite var(--duration) linear infinite;
        }
        .pause-hover:hover {
          animation-play-state: paused;
        }
      `}} />

      <div 
        className={`animate-scroll ${pauseOnHover ? 'pause-hover' : ''}`}
        style={containerStyle}
      >
        {/* Usamos un contenedor único para evitar repetir clases de Flex */}
        <div className="flex items-center gap-(--gap) shrink-0">
          {children}
        </div>
        
        {/* Duplicado idéntico */}
        <div className="flex items-center gap-(--gap) shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfiniteCarousel;