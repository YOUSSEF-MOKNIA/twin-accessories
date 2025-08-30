import React from 'react';
import type { Database, ColorVariant } from '../lib/supabase';

type Product = Database["public"]["Tables"]["products"]["Row"];

interface SoldOutIndicatorProps {
  product: Product;
  compact?: boolean;
  showStockCount?: boolean;
}

const SoldOutIndicator: React.FC<SoldOutIndicatorProps> = ({ 
  product, 
  compact = false,
  showStockCount = false 
}) => {
  // Helper functions
  const isProductCompletelyUnavailable = () => {
    // Product is sold out if explicitly marked as sold out
    if (product.is_sold_out) return true;
    
    // Or if it has color variants and ALL colors are sold out
    if (product.has_color_variants && product.colors) {
      const colors = product.colors as ColorVariant[];
      return colors.length > 0 && colors.every(color => color.is_sold_out);
    }
    
    return false;
  };
  
  const areAllColorsSoldOut = () => {
    if (!product.has_color_variants || !product.colors) return false;
    const colors = product.colors as ColorVariant[];
    return colors.length > 0 && colors.every(color => color.is_sold_out);
  };

  const getAvailableColors = () => {
    // If entire product is marked as sold out, no colors are available
    if (product.is_sold_out) return [];
    
    if (!product.has_color_variants || !product.colors) return [];
    return (product.colors as ColorVariant[]).filter(color => !color.is_sold_out);
  };

  const getSoldOutColors = () => {
    if (!product.has_color_variants || !product.colors) return [];
    
    // If entire product is sold out, all colors are considered sold out
    if (product.is_sold_out) {
      return product.colors as ColorVariant[];
    }
    
    return (product.colors as ColorVariant[]).filter(color => color.is_sold_out);
  };

  const getTotalStock = () => {
    if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
      return product.stock_quantity;
    }
    
    if (product.has_color_variants && product.colors) {
      const colors = product.colors as ColorVariant[];
      const totalStock = colors.reduce((total, color) => {
        if (color.stock_quantity !== null && color.stock_quantity !== undefined) {
          return total + color.stock_quantity;
        }
        return total;
      }, 0);
      return totalStock > 0 ? totalStock : null;
    }
    
    return null;
  };

  // If compact mode, just show basic status
  if (compact) {
    if (isProductCompletelyUnavailable()) {
      return (
        <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          ÉPUISÉ
        </div>
      );
    }

    const availableColors = getAvailableColors();
    const soldOutColors = getSoldOutColors();
    
    if (soldOutColors.length > 0 && availableColors.length > 0) {
      return (
        <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
          PARTIELLEMENT DISPONIBLE
        </div>
      );
    }

    const totalStock = getTotalStock();
    if (showStockCount && totalStock !== null && totalStock < 5) {
      return (
        <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          STOCK LIMITÉ ({totalStock})
        </div>
      );
    }

    return null;
  }

  // Full detailed view
  if (isProductCompletelyUnavailable()) {
    if (product.is_sold_out) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">Produit Épuisé</span>
          </div>
          <p className="text-xs text-red-600 mt-1">Ce produit n'est actuellement plus disponible</p>
        </div>
      );
    } else if (areAllColorsSoldOut()) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">Toutes les Couleurs Épuisées</span>
          </div>
          <p className="text-xs text-red-600 mt-1">Aucune couleur n'est actuellement disponible</p>
        </div>
      );
    }
  }

  const availableColors = getAvailableColors();
  const soldOutColors = getSoldOutColors();

  if (soldOutColors.length > 0) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm font-medium text-orange-800">Disponibilité Limitée</span>
        </div>
        
        <div className="space-y-2 text-xs">
          {availableColors.length > 0 && (
            <div>
              <span className="text-green-700 font-medium">Disponible: </span>
              <span className="text-green-600">
                {availableColors.map(c => c.name).join(', ')}
              </span>
              {showStockCount && (
                <span className="text-green-600">
                  {' '}({availableColors.reduce((total, c) => total + (c.stock_quantity || 0), 0)} en stock)
                </span>
              )}
            </div>
          )}
          
          <div>
            <span className="text-red-700 font-medium">Épuisé: </span>
            <span className="text-red-600">
              {soldOutColors.map(c => c.name).join(', ')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Product is available
  const totalStock = getTotalStock();
  if (showStockCount && totalStock !== null) {
    if (totalStock < 5) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">Stock Limité</span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">Plus que {totalStock} disponible{totalStock > 1 ? 's' : ''}</p>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">En Stock</span>
        </div>
        <p className="text-xs text-green-600 mt-1">{totalStock} disponible{totalStock > 1 ? 's' : ''}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">Disponible</span>
      </div>
    </div>
  );
};

export default SoldOutIndicator;
