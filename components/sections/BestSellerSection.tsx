'use client';

import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';

interface BestSellerSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function BestSellerSection({ products, onAddToCart }: BestSellerSectionProps) {
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  if (bestSellers.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#1F1F1F]">Best Seller</h2>
          <p className="text-xs md:text-sm text-gray-500">Produk paling laris minggu ini</p>
        </div>
      </div>

      <ProductGrid
        products={bestSellers}
        onAddToCart={onAddToCart}
      />
    </motion.section>
  );
}
