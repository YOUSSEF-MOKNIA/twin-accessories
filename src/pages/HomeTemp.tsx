import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Watch, Menu, X, ArrowRight, Phone, Instagram } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";
import AutoScrollingImages from "../components/AutoScrollingImages";
import Footer from "../components/Footer";
import SoldOutIndicator from "../components/SoldOutIndicator";

type Product = Database["public"]["Tables"]["products"]["Row"];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec du chargement des produits"
      );
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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Watch className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
              <span className="text-2xl font-thin text-gray-900 tracking-tight">
                Twin Accessories
              </span>
            </div>

            <nav className="hidden md:flex space-x-12">
              <button
                onClick={() =>
                  document
                    .getElementById("collection")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm font-medium tracking-wide uppercase text-gray-600 hover:text-gray-900 transition-colors"
              >
                Collection
              </button>
              <button
                onClick={() => navigate("/track")}
                className="text-sm font-medium tracking-wide uppercase text-gray-600 hover:text-gray-900 transition-colors"
              >
                Suivi Commande
              </button>
            </nav>

            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-100">
              <nav className="flex flex-col space-y-6">
                <button
                  onClick={() => {
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium tracking-wide uppercase text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Collection
                </button>
                <button
                  onClick={() => {
                    navigate("/track");
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium tracking-wide uppercase text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Suivi Commande
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.03)_0%,transparent_50%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up">
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-thin text-gray-900 mb-8 tracking-tighter leading-none">
                  Twins
                  <span className="block italic font-light">Accessories</span>
                </h1>
                <div className="w-24 h-px bg-gray-400 mb-8 mx-auto lg:mx-0 animate-slide-in"></div>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up-delay">
                  Excellence horlogère pour l'homme moderne
                </p>
                <button
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center px-12 py-4 bg-gray-900 text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-800 transition-all duration-500 hover:scale-105 animate-fade-in-up-delay-2"
                >
                  Découvrir la Collection
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Hero Watch Image */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50 blur-3xl rounded-full scale-75 animate-pulse-slow"></div>
                <img
                  src="/HERO.png"
                  alt="Luxury watch Twin Accessories"
                  className="relative z-10 w-80 h-80 lg:w-96 lg:h-96 object-contain filter drop-shadow-2xl hover:scale-110 transition-transform duration-700 cursor-pointer"
                  style={{
                    filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))",
                  }}
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin text-gray-900 mb-8 tracking-tight animate-fade-in-up">
              Notre Collection
            </h2>
            <div className="w-24 h-px bg-gray-400 mx-auto mb-8 animate-slide-in"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up-delay">
              Chaque garde-temps est méticuleusement sélectionné pour son
              savoir-faire exceptionnel
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Impossible de charger la collection
              </h3>
              <p className="text-gray-600 mb-8 font-light">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-8 py-3 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Collection Bientôt Disponible
              </h3>
              <p className="text-gray-600 font-light">
                Notre sélection curée sera disponible sous peu
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`group animate-fade-in-up ${
                    product.is_sold_out ? "opacity-75" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative mb-8 overflow-hidden bg-gray-50 aspect-square rounded-lg">
                    <AutoScrollingImages
                      product={product}
                      className="w-full h-full relative"
                      showIndicators={true}
                      showColorDots={true}
                      scrollInterval={4000}
                      pauseOnHover={true}
                      enableFadeTransition={true}
                    />
                    {product.is_sold_out && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase">
                          ÉPUISÉ
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-8 py-3 bg-white text-gray-900 text-sm font-medium tracking-wide uppercase hover:bg-gray-100"
                        disabled={product.is_sold_out}
                      >
                        {product.is_sold_out ? "ÉPUISÉ" : "Voir Détails"}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-light text-gray-900 tracking-wide">
                        {product.name}
                      </h3>
                      <SoldOutIndicator
                        product={product}
                        compact={true}
                        showStockCount={true}
                      />
                    </div>
                    <p className="text-gray-600 mb-4 font-light leading-relaxed">
                      {product.description}
                    </p>

                    {/* Stock status indicators */}
                    {product.has_color_variants && product.colors && (
                      <div className="mb-4">
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                          {(product.colors as any[]).map((color, index) => (
                            <div
                              key={index}
                              className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                                color.is_sold_out
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  color.is_sold_out ? "opacity-50" : ""
                                }`}
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                              {color.is_sold_out && <span>- Épuisé</span>}
                              {color.stock_quantity !== null &&
                                color.stock_quantity !== undefined &&
                                !color.is_sold_out && (
                                  <span>({color.stock_quantity})</span>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-light text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={() =>
                          navigate("/order", {
                            state: { selectedProduct: product },
                          })
                        }
                        disabled={product.is_sold_out}
                        className={`text-sm font-medium transition-colors tracking-wide uppercase border-b ${
                          product.is_sold_out
                            ? "text-gray-400 border-gray-200 cursor-not-allowed"
                            : "text-gray-900 hover:text-gray-600 border-gray-300 hover:border-gray-900"
                        }`}
                      >
                        {product.is_sold_out ? "ÉPUISÉ" : "Commander"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
