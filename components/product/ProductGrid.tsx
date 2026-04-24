'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  title?: string;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  isLoading = false,
  onAddToCart,
  title,
  emptyMessage = 'Tidak ada produk tersedia',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-lg md:text-xl font-bold text-[#1F1F1F]">{title}</h2>}
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-[#1F1F1F]">{title}</h2>
          {products.length > 8 && (
            <button className="text-sm text-[#03AC0E] font-medium hover:underline">
              Lihat Semua
            </button>
          )}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}
