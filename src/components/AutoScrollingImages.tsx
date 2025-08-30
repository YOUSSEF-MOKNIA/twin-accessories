import React, { useEffect, useState, useCallback } from "react";
import type { Database, ColorVariant } from "../lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface AutoScrollingImagesProps {
  product: Product;
  className?: string;
  showIndicators?: boolean;
  showColorDots?: boolean;
  scrollInterval?: number;
  pauseOnHover?: boolean;
  enableFadeTransition?: boolean;
}

const AutoScrollingImages: React.FC<AutoScrollingImagesProps> = ({
  product,
  className = "aspect-square w-full bg-gray-200 overflow-hidden relative",
  showIndicators = true,
  showColorDots = true,
  scrollInterval = 2000,
  pauseOnHover = true,
  enableFadeTransition = true,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Collect all images for this product
    const allImages: string[] = [];

    if (product.has_color_variants && product.colors) {
      // If product has color variants, collect all images from all colors
      const colors = product.colors as ColorVariant[];
      colors.forEach((color) => {
        if (color.images && color.images.length > 0) {
          allImages.push(...color.images);
        }
      });
    } else {
      // For regular products, use image_url and images array
      if (product.image_url) {
        allImages.push(product.image_url);
      }
      if (product.images && product.images.length > 0) {
        allImages.push(...product.images);
      }
    }

    // Remove duplicates and set images
    const uniqueImages = [...new Set(allImages)];
    setImages(uniqueImages);
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [product]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (!isHovered || !pauseOnHover) {
        if (enableFadeTransition) {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentImageIndex((prevIndex) =>
              prevIndex >= images.length - 1 ? 0 : prevIndex + 1
            );
            setIsTransitioning(false);
          }, 150); // Short fade duration
        } else {
          setCurrentImageIndex((prevIndex) =>
            prevIndex >= images.length - 1 ? 0 : prevIndex + 1
          );
        }
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [
    images.length,
    scrollInterval,
    isHovered,
    pauseOnHover,
    enableFadeTransition,
  ]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleImageClick = useCallback(() => {
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex >= images.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [images.length]);

  const currentImage =
    images[currentImageIndex] ||
    product.image_url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center";

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading overlay */}
      {!imageLoaded && images.length > 0 && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={currentImage}
        alt={product.name}
        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-300 ${
          enableFadeTransition && isTransitioning ? "opacity-50" : "opacity-100"
        } ${imageLoaded ? "opacity-100" : "opacity-0"} ${
          images.length > 1 ? "cursor-pointer" : ""
        }`}
        onLoad={handleImageLoad}
        onClick={handleImageClick}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center`;
          setImageLoaded(true);
        }}
      />

      {/* Multi-image indicator */}
      {images.length > 1 && (
        <div className="absolute top-2 left-2">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {images.length} photos
          </div>
        </div>
      )}

      {/* Image indicator dots */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white scale-110 shadow-lg"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Color variants indicator */}
      {showColorDots && product.has_color_variants && product.colors && (
        <div className="absolute top-2 right-2">
          <div className="flex space-x-1">
            {(product.colors as ColorVariant[])
              .slice(0, 3)
              .map((color, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    color.is_sold_out ? "opacity-50" : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name}${color.is_sold_out ? " - Épuisé" : ""}`}
                />
              ))}
            {(product.colors as ColorVariant[]).length > 3 && (
              <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-gray-700 text-white text-xs flex items-center justify-center font-bold">
                +
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pause indicator */}
      {isHovered && pauseOnHover && images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            ⏸ Paused
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoScrollingImages;
