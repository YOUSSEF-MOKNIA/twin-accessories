import React, { useState } from "react";
import {
  Search,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  products: Database["public"]["Tables"]["products"]["Row"];
};

const OrderTracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          products (*)
        `
        )
        .eq("tracking_number", trackingNumber.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError(
            "Numéro de suivi introuvable. Veuillez vérifier et réessayer."
          );
        } else {
          throw error;
        }
        return;
      }

      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la recherche de la commande"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case "shipped":
        return <Truck className="h-6 w-6 text-purple-500" />;
      case "delivered":
        return <MapPin className="h-6 w-6 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente de confirmation";
      case "confirmed":
        return "Commande confirmée";
      case "shipped":
        return "Expédiée";
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-thin text-gray-900 mb-4">
            Suivi de Commande
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Entrez votre numéro de suivi pour voir l'état de votre commande
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ex: TW20250828001"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="w-full mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Order Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-light text-gray-900">
                  Commande #{order.tracking_number}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{getStatusText(order.status)}</span>
                </span>
              </div>
              <p className="text-gray-600">
                Commandée le {formatDate(order.created_at)}
              </p>
            </div>

            {/* Customer Info */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations de livraison
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nom:</span>{" "}
                  {order.customer_name}
                </p>
                <p>
                  <span className="font-medium">Téléphone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span> {order.address}
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Article commandé
              </h3>
              <div className="flex items-center space-x-4">
                <img
                  src={order.products.image_url}
                  alt={order.products.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {order.products.name}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    {order.products.description}
                  </p>
                  {order.selected_color && (
                    <p className="text-sm text-gray-500">
                      Couleur: {order.selected_color}
                    </p>
                  )}
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    {formatPrice(order.products.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Suivi de la commande
              </h3>
              <div className="space-y-4">
                {[
                  { status: "pending", label: "Commande reçue" },
                  { status: "confirmed", label: "Commande confirmée" },
                  { status: "shipped", label: "Expédiée" },
                  { status: "delivered", label: "Livrée" },
                ].map((step, index) => {
                  const isActive =
                    (order.status === "pending" && step.status === "pending") ||
                    (order.status === "confirmed" &&
                      ["pending", "confirmed"].includes(step.status)) ||
                    (order.status === "shipped" &&
                      ["pending", "confirmed", "shipped"].includes(
                        step.status
                      )) ||
                    (order.status === "delivered" &&
                      ["pending", "confirmed", "shipped", "delivered"].includes(
                        step.status
                      ));

                  const isCurrent = order.status === step.status;

                  return (
                    <div key={step.status} className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? isCurrent
                              ? "bg-gray-900 text-white"
                              : "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isActive && !isCurrent ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <p
                          className={`text-sm font-medium ${
                            isActive ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
