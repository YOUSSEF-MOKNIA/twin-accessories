import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database, ColorVariant } from "../lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface OrderFormData {
  customer_name: string;
  phone: string;
  address: string;
  selected_color?: string;
}

const Order: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProduct = location.state?.selectedProduct as
    | Product
    | undefined;
  const preSelectedColor = location.state?.selectedColor as string | undefined;

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customer_name: "",
    phone: "",
    address: "",
    selected_color: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  // Gestion des couleurs
  React.useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.has_color_variants && selectedProduct.colors) {
        const colors = selectedProduct.colors as ColorVariant[];
        const availableColors = colors.filter((c) => !c.is_sold_out);

        if (availableColors.length > 0) {
          // Use pre-selected color if available and not sold out, otherwise use first available color
          let colorToSelect: string;
          if (
            preSelectedColor &&
            availableColors.find((c) => c.name === preSelectedColor)
          ) {
            colorToSelect = preSelectedColor;
          } else {
            colorToSelect = availableColors[0].name;
          }

          const selectedColorData = colors.find(
            (c) => c.name === colorToSelect
          )!;

          setSelectedColor(colorToSelect);
          setCurrentImages(selectedColorData.images || []);
          setOrderForm((prev) => ({ ...prev, selected_color: colorToSelect }));
        }
      } else if (selectedProduct.image_url) {
        setCurrentImages([selectedProduct.image_url]);
      }
    }
  }, [selectedProduct, preSelectedColor]);

  const handleColorChange = (colorName: string) => {
    if (selectedProduct?.colors) {
      const colors = selectedProduct.colors as ColorVariant[];
      const color = colors.find((c) => c.name === colorName);
      if (color) {
        setSelectedColor(colorName);
        setCurrentImages(color.images || []);
        setOrderForm((prev) => ({ ...prev, selected_color: colorName }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Validation: Check if selected color is sold out
    if (
      selectedProduct.has_color_variants &&
      selectedProduct.colors &&
      orderForm.selected_color
    ) {
      const colors = selectedProduct.colors as ColorVariant[];
      const selectedColorData = colors.find(
        (c) => c.name === orderForm.selected_color
      );
      if (selectedColorData?.is_sold_out) {
        alert(
          "La couleur sélectionnée n'est plus disponible. Veuillez choisir une autre couleur."
        );
        return;
      }
    }

    // Validation: Check if product is sold out
    if (selectedProduct.is_sold_out) {
      alert("Ce produit n'est plus disponible.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: orderForm.customer_name,
            phone: orderForm.phone,
            address: orderForm.address,
            product_id: selectedProduct.id,
            selected_color: orderForm.selected_color || null,
            status: "pending",
          },
        ])
        .select("tracking_number")
        .single();

      if (error) throw error;

      if (data?.tracking_number) {
        setTrackingNumber(data.tracking_number);
      }

      setOrderSuccess(true);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Aucun produit sélectionné
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

  // Check if product is completely sold out
  const isProductSoldOut =
    selectedProduct.is_sold_out ||
    (selectedProduct.has_color_variants &&
      selectedProduct.colors &&
      (selectedProduct.colors as ColorVariant[]).every(
        (color) => color.is_sold_out
      ));

  if (isProductSoldOut) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Produit Épuisé
          </h2>
          <p className="text-gray-600 mb-6">
            Ce produit n'est actuellement plus disponible.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Retour à la Collection
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Commande Confirmée!
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Numéro de suivi:</p>
            <p className="text-xl font-bold text-gray-900 mb-3">
              {trackingNumber}
            </p>
            <button
              onClick={() => navigate("/track")}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Suivre votre commande
            </button>
          </div>
          <p className="text-gray-600 font-light mb-6">
            Merci pour votre commande! Nous vous contacterons sous 24h pour
            confirmer les détails et organiser la livraison.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/track")}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Suivre ma commande
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>

      {/* Order Form */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Summary */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-thin text-gray-900 mb-6 tracking-tight">
                Finaliser la Commande
              </h1>
              <div className="w-24 h-px bg-gray-400 mb-8"></div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={
                    currentImages[0] ||
                    selectedProduct.image_url ||
                    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop"
                  }
                  alt={selectedProduct.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-light text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 text-sm font-light mb-3">
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.has_color_variants && selectedColor && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Couleur:</span>{" "}
                      {selectedColor}
                    </p>
                  )}
                  <div className="text-2xl font-light text-gray-900">
                    {formatPrice(selectedProduct.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">
                Informations de livraison
              </h3>
              <div className="space-y-2 text-sm text-gray-600 font-light">
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="flex justify-between">
                  <span>Délai</span>
                  <span>3-5 jours ouvrés</span>
                </div>
                <div className="flex justify-between">
                  <span>Paiement</span>
                  <span>À la livraison</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(selectedProduct.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Color Selection */}
              {selectedProduct.has_color_variants && selectedProduct.colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Couleur *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(selectedProduct.colors as ColorVariant[]).map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() =>
                          !color.is_sold_out &&
                          !selectedProduct.is_sold_out &&
                          handleColorChange(color.name)
                        }
                        disabled={
                          color.is_sold_out || selectedProduct.is_sold_out
                        }
                        className={`p-4 border rounded-lg text-left transition-all relative ${
                          selectedColor === color.name &&
                          !color.is_sold_out &&
                          !selectedProduct.is_sold_out
                            ? "border-gray-900 bg-gray-50"
                            : color.is_sold_out || selectedProduct.is_sold_out
                            ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${
                              color.is_sold_out || selectedProduct.is_sold_out
                                ? "opacity-50"
                                : ""
                            }`}
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div className="flex-1">
                            <span
                              className={`text-sm font-medium ${
                                color.is_sold_out || selectedProduct.is_sold_out
                                  ? "text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {color.name}
                            </span>
                            {(color.is_sold_out ||
                              selectedProduct.is_sold_out) && (
                              <div className="text-xs text-red-600 font-medium">
                                {selectedProduct.is_sold_out
                                  ? "Produit épuisé"
                                  : "Épuisé"}
                              </div>
                            )}
                            {color.stock_quantity !== null &&
                              color.stock_quantity !== undefined &&
                              !color.is_sold_out &&
                              !selectedProduct.is_sold_out && (
                                <div className="text-xs text-gray-500">
                                  {color.stock_quantity} disponible
                                  {color.stock_quantity > 1 ? "s" : ""}
                                </div>
                              )}
                          </div>
                        </div>
                        {(color.is_sold_out || selectedProduct.is_sold_out) && (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.customer_name}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      customer_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-light"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Numéro de Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.phone}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-light"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Adresse de Livraison *
                </label>
                <textarea
                  required
                  rows={4}
                  value={orderForm.address}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, address: e.target.value })
                  }
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-light resize-none"
                  placeholder="Votre adresse complète de livraison"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Commande en cours..." : "Confirmer la Commande"}
                </button>
              </div>
            </form>

            <div className="text-center text-sm text-gray-500 font-light">
              <p>En passant commande, vous acceptez nos conditions de vente.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
