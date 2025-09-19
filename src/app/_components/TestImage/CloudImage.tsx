"use client";
import { CldImage } from 'next-cloudinary';

type ImageDataProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  properties?: Record<string, any>;
};

export default function Page(Props: ImageDataProps) {
  const { src, width, height, alt, properties } = Props;

  if(!src) {
    return null;
  }

  console.log(src)

  return (
    <CldImage
      src={src}
      width={width}
      height={height}
      alt={alt}
      crop={{
        type: 'auto',
        source: true
      }}
      {...properties}
    />
  );
}