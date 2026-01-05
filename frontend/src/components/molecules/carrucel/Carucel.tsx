import { Carousel, Image } from "antd";

interface CarrucelImagenesProps {
  images: string[];
  height?: number;
  fallback: string;
  preview?: boolean;
  dots?: boolean;
  autoplay?: boolean;
}

function CarrucelImagenes({
  images,
  height = 160,
  fallback,
  preview = true,
  dots = true,
  autoplay = true,
}: CarrucelImagenesProps) {
  const sources = images.length ? images : [fallback];

  return (
    <Image.PreviewGroup items={sources}>
      <Carousel dots={dots} autoplay={autoplay}>
        {sources.map((src, index) => (
          <div key={index}>
            <Image
              src={src}
              height={height}
              width="100%"
              style={{ objectFit: "cover" }}
              preview={preview}
            />
          </div>
        ))}
      </Carousel>
    </Image.PreviewGroup>
  );
}

export default CarrucelImagenes;
