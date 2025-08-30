import React, { useState } from 'react';
import { Search, Package, Truck, MapPin, CheckCircle, Clock, AlertCircle, Phone, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Order = Database['public']['Tables']['orders']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};

const OrderTracking: React.FC = () => {
  const [searchMethod, setSearchMethod] = useState<'phone' | 'tracking'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !customerName.trim()) return;

    setLoading(true);
    setError(null);
    setOrders([]);
    setSelectedOrder(null);

    try {
      // Clean and normalize the inputs
      const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
      const cleanName = customerName.trim();

      // Try exact phone match with exact name match first
      let { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (*)
        `)
        .eq('phone', cleanPhone)
        .eq('customer_name', cleanName);

      // If no exact match, try with case-insensitive partial name match
      if (!data || data.length === 0) {
        const { data: nameData, error: nameError } = await supabase
          .from('orders')
          .select(`
            *,
            products (*)
          `)
          .eq('phone', cleanPhone)
          .ilike('customer_name', `%${cleanName}%`);
        
        if (nameData && nameData.length > 0) {
          data = nameData;
          error = nameError;
        }
      }

      // If still no results, try with different phone formats
      if (!data || data.length === 0) {
        // Try without country code if phone starts with +
        if (cleanPhone.startsWith('+')) {
          const phoneWithoutCountry = cleanPhone.substring(4); // Remove +212
          const { data: altData, error: altError } = await supabase
            .from('orders')
            .select(`
              *,
              products (*)
            `)
            .eq('phone', phoneWithoutCountry)
            .ilike('customer_name', `%${cleanName}%`);
          
          if (altData && altData.length > 0) {
            data = altData;
            error = altError;
          }
        } else {
          // Try with Morocco country code
          const phoneWithCountry = '+212' + cleanPhone;
          const { data: altData, error: altError } = await supabase
            .from('orders')
            .select(`
              *,
              products (*)
            `)
            .eq('phone', phoneWithCountry)
            .ilike('customer_name', `%${cleanName}%`);
          
          if (altData && altData.length > 0) {
            data = altData;
            error = altError;
          }
        }
      }

      // If still no results, try fuzzy search on both phone and name
      if (!data || data.length === 0) {
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('orders')
          .select(`
            *,
            products (*)
          `)
          .or(`phone.like.%${cleanPhone}%,phone.like.%${cleanPhone.replace('+212', '')}%`)
          .ilike('customer_name', `%${cleanName}%`);
        
        if (fuzzyData && fuzzyData.length > 0) {
          data = fuzzyData;
          error = fuzzyError;
        }
      }

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Aucune commande trouvée avec ce numéro de téléphone et ce nom.');
        return;
      }

      setOrders(data);
      if (data.length === 1) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setOrders([]);
    setSelectedOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (*)
        `)
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Numéro de suivi introuvable. Veuillez vérifier et réessayer.');
        } else {
          throw error;
        }
        return;
      }

      setSelectedOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <MapPin className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente de confirmation';
      case 'confirmed':
        return 'Commande confirmée';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-light text-gray-900">
            Commande #{order.tracking_number}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-2">{getStatusText(order.status)}</span>
          </span>
        </div>
        <p className="text-gray-600">
          Commandée le {formatDate(order.created_at)}
        </p>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img
            src={order.products.image_url}
            alt={order.products.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="text-lg font-medium text-gray-900">
              {order.products.name}
            </h4>
            {order.selected_color && (
              <p className="text-sm text-gray-500">
                Couleur: {order.selected_color}
              </p>
            )}
            <p className="text-lg font-medium text-gray-900 mt-1">
              {formatPrice(order.products.price)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="border-t border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Statut de la commande
        </h4>
        <div className="space-y-3">
          {[
            { status: 'pending', label: 'Commande reçue' },
            { status: 'confirmed', label: 'Commande confirmée' },
            { status: 'shipped', label: 'Expédiée' },
            { status: 'delivered', label: 'Livrée' },
          ].map((step, index) => {
            const isActive = 
              (order.status === 'pending' && step.status === 'pending') ||
              (order.status === 'confirmed' && ['pending', 'confirmed'].includes(step.status)) ||
              (order.status === 'shipped' && ['pending', 'confirmed', 'shipped'].includes(step.status)) ||
              (order.status === 'delivered' && ['pending', 'confirmed', 'shipped', 'delivered'].includes(step.status));
            
            const isCurrent = order.status === step.status;
            
            return (
              <div key={step.status} className="flex items-center">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive 
                    ? isCurrent 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isActive && !isCurrent ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-thin text-gray-900 mb-4">
            Suivi de Commande
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Recherchez vos commandes facilement
          </p>
        </div>

        {/* Search Method Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMethod('phone')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMethod === 'phone'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Phone className="inline h-4 w-4 mr-2" />
                Téléphone + Nom
              </button>
              <button
                onClick={() => setSearchMethod('tracking')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMethod === 'tracking'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="inline h-4 w-4 mr-2" />
                Numéro de suivi
              </button>
            </div>
          </div>

          {/* Search Form */}
          {searchMethod === 'phone' ? (
            <form onSubmit={handleSearchByPhone} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Votre numéro de téléphone"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading || !phoneNumber.trim() || !customerName.trim()}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Recherche...' : 'Rechercher mes commandes'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSearchByTracking} className="max-w-md mx-auto">
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
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          )}
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

        {/* Multiple Orders List */}
        {orders.length > 1 && !selectedOrder && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-light text-gray-900">
              Vos commandes ({orders.length})
            </h2>
            <div className="grid gap-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">#{order.tracking_number}</p>
                      <p className="text-sm text-gray-600">{order.products.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Order Details */}
        {selectedOrder && (
          <div className="space-y-6">
            {orders.length > 1 && (
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour à la liste des commandes
              </button>
            )}
            {renderOrderCard(selectedOrder)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
