import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Shield, Truck, Star, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Animate products in sequence
    if (products.length > 0) {
      products.forEach((_, index) => {
        setTimeout(() => {
          setVisibleProducts((prev) => new Set([...prev, index]));
        }, index * 150); // Stagger animation by 150ms
      });
    }
  }, [products]);

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
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const features = [
    {
      icon: Clock,
      title: "Precision Timekeeping",
      description: "Swiss-grade movements for accurate timekeeping",
    },
    {
      icon: Shield,
      title: "2-Year Warranty",
      description: "Comprehensive warranty on all timepieces",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on all orders nationwide",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimal and Elegant */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight">
              TwinWatches
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light max-w-2xl mx-auto leading-relaxed">
              Exquisite timepieces crafted for the discerning gentleman
            </p>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-12"></div>
            <button
              onClick={() =>
                document
                  .getElementById("collection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              Discover Collection
              <ArrowRight className="ml-3 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Our Collection
            </h2>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Each timepiece is meticulously selected for its exceptional
              craftsmanship and timeless elegance
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-gray-200 rounded-full"></div>
                <div className="w-16 h-16 border-2 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Unable to load collection
                </h3>
                <p className="text-gray-600 mb-8 font-light">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Collection Coming Soon
              </h3>
              <p className="text-gray-600 font-light">
                Our curated selection will be available shortly
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`group transition-all duration-700 transform ${
                    visibleProducts.has(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Product Image */}
                  <div className="relative mb-6 overflow-hidden bg-gray-50 aspect-square">
                    <img
                      src={product.image_url || "/placeholder-watch.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop&auto=format";
                      }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Link
                        to={`/product/${product.id}`}
                        className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center px-6 py-3 bg-white text-gray-900 text-sm font-medium tracking-wide uppercase shadow-lg"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-light text-gray-900 mb-2 tracking-wide">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 font-light text-sm leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-light text-gray-900 tracking-wide">
                        {formatPrice(product.price)}
                      </span>
                      <Link
                        to="/order"
                        state={{ selectedProduct: product }}
                        className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors tracking-wide uppercase"
                      >
                        Order Now
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Minimal */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
                  <feature.icon className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Elegant */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            Find Your Perfect Timepiece
          </h2>
          <div className="w-24 h-px bg-white bg-opacity-30 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Let our experts help you discover the watch that perfectly matches
            your style and personality
          </p>
          <Link
            to="/order"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 text-sm font-medium tracking-wide uppercase hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
            <ArrowRight className="ml-3 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
