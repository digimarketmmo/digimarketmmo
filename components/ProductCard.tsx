import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types.ts';
import { formatCurrency } from '../utils/formatter.ts';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Star, Gem } from './icons.tsx';

interface ProductCardProps {
  product: Product;
  isSponsored?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSponsored = false }) => {
  const context = useContext(AppContext) as AppContextType;
  if (!context) return null;
  const { categories } = context;

  const { lowestPrice, totalStock } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { lowestPrice: 0, totalStock: 0 };
    }
    const lowest = Math.min(...product.variants.map(v => v.price));
    const total = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return { lowestPrice: lowest, totalStock: total };
  }, [product.variants]);
  
  const categoryName = useMemo(() => {
      return categories.find(c => c.id === product.categoryId)?.name || 'N/A';
  }, [categories, product.categoryId]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-primary-500/20 transition-all duration-300 group flex flex-col">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-700" 
                loading="lazy"
                decoding="async"
            />
            {isSponsored && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                    <Gem size={12} />
                    <span>Tài trợ</span>
                </div>
            )}
            <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                {categoryName}
            </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors break-words">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow break-words">{product.description.substring(0, 40)}...</p>
        
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1 text-yellow-400">
                <Star size={16} fill="currentColor" />
                <span className="text-white font-bold">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({product.reviews.length})</span>
            </div>
            <span className="text-sm text-gray-300">Còn lại: {totalStock}</span>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-xl font-bold text-primary-400">
            {product.variants.length > 1 ? 'Từ ' : ''}{formatCurrency(lowestPrice)}
          </p>
        </div>
      </div>
    </div>
  );
};