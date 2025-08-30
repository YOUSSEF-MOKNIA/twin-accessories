import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Shield, Truck } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";
import AutoScrollingImages from "../components/AutoScrollingImages";

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
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
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
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Premium Men's
              <span
                className="block text-primary-400 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                Watches
              </span>
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              Discover our collection of luxury timepieces crafted for the
              modern gentleman. Each watch tells a story of precision, elegance,
              and timeless style.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Why Choose Twins Accessories?
            </h2>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              We're committed to delivering exceptional quality and service with
              every timepiece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center animate-slide-up hover:transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 transition-colors hover:bg-primary-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Our Premium Collection
            </h2>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Handpicked timepieces that combine traditional craftsmanship with
              modern elegance.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Unable to load products
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No products available
              </h3>
              <p className="text-gray-600">
                Check back soon for our latest collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`group bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-xl transition-all duration-500 transform ${
                    visibleProducts.has(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <AutoScrollingImages
                    product={product}
                    className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100"
                    showIndicators={true}
                    showColorDots={true}
                    scrollInterval={3000}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transform hover:scale-105 transition-all duration-200"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            Need Help Choosing?
          </h2>
          <p
            className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Our experts are here to help you find the perfect timepiece for your
            style and budget.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            Start Your Order
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
