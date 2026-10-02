import React from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
}

export function Image({ src, alt, width, height, fill, className, style, ...props }: ImageProps) {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }
      : {}),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={customStyle}
      {...props}
    />
  );
}

export default Image;
