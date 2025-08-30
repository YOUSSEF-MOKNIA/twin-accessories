import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database, ColorVariant } from "../lib/supabase";
import SoldOutIndicator from "../components/SoldOutIndicator";

type Product = Database["public"]["Tables"]["products"]["Row"];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      initializeImages();
    }
  }, [product]);

  const initializeImages = () => {
    if (!product) return;

    if (product.has_color_variants && product.colors) {
      const colors = product.colors as ColorVariant[];
      const availableColors = colors.filter(c => !c.is_sold_out);
      
      if (availableColors.length > 0) {
        // Use first available color
        const firstAvailableColor = availableColors[0];
        setSelectedColor(firstAvailableColor.name);
        setCurrentImages(firstAvailableColor.images || []);
        setCurrentImageIndex(0);
      } else if (colors.length > 0) {
        // All colors sold out, but show first color for display
        const firstColor = colors[0];
        setSelectedColor(firstColor.name);
        setCurrentImages(firstColor.images || []);
        setCurrentImageIndex(0);
      }
    } else {
      // Traditional product with regular images
      const allImages = [];
      if (product.image_url) {
        allImages.push(product.image_url);
      }
      if (product.images && product.images.length > 0) {
        allImages.push(...product.images);
      }
      setCurrentImages(allImages);
      setCurrentImageIndex(0);
    }
  };

  const handleColorChange = (colorName: string) => {
    if (product?.colors) {
      const colors = product.colors as ColorVariant[];
      const color = colors.find((c) => c.name === colorName);
      if (color) {
        setSelectedColor(colorName);
        setCurrentImages(color.images || []);
        setCurrentImageIndex(0);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  // Helper function to check if ordering is disabled
  const isOrderingDisabled = (): boolean => {
    // Product is unavailable if explicitly marked as sold out
    if (product?.is_sold_out) return true;
    
    // Or if it has color variants and all colors are sold out
    if (product?.has_color_variants && product.colors) {
      const colors = product.colors as ColorVariant[];
      if (colors.length > 0 && colors.every(color => color.is_sold_out)) return true;
    }
    
    // Or if a specific color is selected and it's sold out
    if (product?.has_color_variants && selectedColor && product.colors) {
      const selectedColorData = (product.colors as ColorVariant[]).find(c => c.name === selectedColor);
      return selectedColorData?.is_sold_out === true;
    }
    
    return false;
  };

  // Helper function to check if all colors are sold out
  const areAllColorsSoldOut = (): boolean => {
    if (!product?.has_color_variants || !product.colors) return false;
    const colors = product.colors as ColorVariant[];
    return colors.length > 0 && colors.every(color => color.is_sold_out);
  };

  // Helper function to check if product is completely unavailable
  const isProductCompletelyUnavailable = (): boolean => {
    if (product?.is_sold_out) return true;
    return areAllColorsSoldOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Produit non trouvé
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const allImages = currentImages.length > 0 ? currentImages : [];
  const currentImage =
    allImages[currentImageIndex] ||
    product.image_url ||
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la collection
          </button>
        </div>
      </div>

      {/* Product Detail */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
              <img
                src={currentImage}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Sold out overlay */}
              {isProductCompletelyUnavailable() && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-medium tracking-wide uppercase">
                    ÉPUISÉ
                  </span>
                </div>
              )}

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex > 0
                          ? currentImageIndex - 1
                          : allImages.length - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex < allImages.length - 1
                          ? currentImageIndex + 1
                          : 0
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image Indicator */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? "border-gray-900"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-thin text-gray-900 mb-6 tracking-tight">
                {product.name}
              </h1>
              <div className="w-24 h-px bg-gray-400 mb-8"></div>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {product.has_color_variants && product.colors && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Couleur</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(product.colors as ColorVariant[]).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => !color.is_sold_out && !product.is_sold_out && handleColorChange(color.name)}
                      disabled={color.is_sold_out || product.is_sold_out}
                      className={`p-4 border rounded-lg text-left transition-all relative ${
                        selectedColor === color.name && !color.is_sold_out && !product.is_sold_out
                          ? "border-gray-900 bg-gray-50"
                          : color.is_sold_out || product.is_sold_out
                          ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${
                            color.is_sold_out || product.is_sold_out ? 'opacity-50' : ''
                          }`}
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${
                            color.is_sold_out || product.is_sold_out ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {color.name}
                          </span>
                          {(color.is_sold_out || product.is_sold_out) && (
                            <div className="text-xs text-red-600 font-medium">
                              {product.is_sold_out ? 'Produit épuisé' : 'Épuisé'}
                            </div>
                          )}
                          {color.stock_quantity !== null && color.stock_quantity !== undefined && !color.is_sold_out && !product.is_sold_out && (
                            <div className="text-xs text-gray-500">
                              {color.stock_quantity} disponible{color.stock_quantity > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      {(color.is_sold_out || product.is_sold_out) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
                          <span className="text-xs text-red-600 font-semibold uppercase tracking-wide">
                            Épuisé
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-4xl font-thin text-gray-900">
              {formatPrice(product.price)}
            </div>

            {/* Stock Status Indicator */}
            <SoldOutIndicator 
              product={product} 
              showStockCount={true}
            />

            <div className="space-y-4">
              {/* Stock status indicator */}
              {product.is_sold_out ? (
                <div className="w-full px-8 py-4 bg-red-100 border border-red-300 text-red-800 text-sm font-medium tracking-wide uppercase text-center rounded-lg">
                  Produit Épuisé
                </div>
              ) : areAllColorsSoldOut() ? (
                <div className="w-full px-8 py-4 bg-red-100 border border-red-300 text-red-800 text-sm font-medium tracking-wide uppercase text-center rounded-lg">
                  Toutes les Couleurs Épuisées
                </div>
              ) : product.has_color_variants && selectedColor && 
                (product.colors as ColorVariant[]).find(c => c.name === selectedColor)?.is_sold_out ? (
                <div className="w-full px-8 py-4 bg-orange-100 border border-orange-300 text-orange-800 text-sm font-medium tracking-wide uppercase text-center rounded-lg">
                  Couleur Sélectionnée Épuisée
                </div>
              ) : (
                <button
                  onClick={() =>
                    navigate("/order", {
                      state: {
                        selectedProduct: product,
                        selectedColor: selectedColor || null,
                      },
                    })
                  }
                  disabled={isOrderingDisabled()}
                  className="w-full px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Commander Maintenant</span>
                </button>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full px-8 py-4 border border-gray-300 text-gray-900 text-sm font-medium tracking-wide uppercase hover:bg-gray-50 transition-colors"
              >
                Continuer les Achats
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
