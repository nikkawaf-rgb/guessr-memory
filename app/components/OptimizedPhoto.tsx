import Image from "next/image";
import { photoPublicUrl } from "@/app/lib/publicUrl";

interface OptimizedPhotoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export function OptimizedPhoto({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
}: OptimizedPhotoProps) {
  // If src is a storage path, convert to public URL
  const imageSrc = src.startsWith("photos/") ? photoPublicUrl(src) : src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}

// Thumbnail component for gallery
export function PhotoThumbnail({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className="relative w-full h-40">
      <OptimizedPhoto
        src={src}
        alt={alt}
        fill
        className={`object-cover rounded border border-white/10 group-hover:opacity-90 ${className}`}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 200px"
        quality={60}
      />
    </div>
  );
}

// Full-size photo component for detail pages
export function PhotoDetail({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedPhoto
      src={src}
      alt={alt}
      width={1200}
      height={800}
      className={`w-full h-auto rounded mb-4 object-contain ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      quality={85}
      priority={true}
    />
  );
}

// Game session photo component
export function GamePhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedPhoto
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={`w-full h-auto rounded ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
      quality={80}
      priority={true}
    />
  );
}
