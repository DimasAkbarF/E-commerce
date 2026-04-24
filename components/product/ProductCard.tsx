'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/supabase';
import { formatPrice, truncateText } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      onAddToCart?.(product);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: isOutOfStock ? 0 : -4 }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className={`bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 ${isOutOfStock ? 'opacity-75' : ''}`}>
          {/* Image Container */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2.5">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Out of Stock Badge */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Badge variant="danger" className="text-sm px-3 py-1">
                  Stok Habis
                </Badge>
              </div>
            )}

            {/* Hover Overlay */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute inset-0 bg-black/5"
              />
            )}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            {/* Category */}
            <p className="text-xs text-[#6B7280]">{product.category}</p>

            {/* Name */}
            <h3 className="text-sm font-medium text-[#1F1F1F] line-clamp-2 min-h-[2.5rem]">
              {truncateText(product.name, 40)}
            </h3>

            {/* Stock Info */}
            <div className="flex items-center gap-1">
              <span className={`text-xs ${
                product.stock > 10 ? 'text-green-600' :
                product.stock > 0 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {product.stock > 10 ? 'Stok Tersedia' :
                 product.stock > 0 ? `Stok: ${product.stock}` :
                 'Stok Habis'}
              </span>
            </div>

            {/* Price */}
            <div className="pt-1">
              <p className="text-base font-bold text-[#EF4444]">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Add to Cart Button */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.2 }}
                className="pt-1"
              >
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleAddToCart}
                  className="text-sm"
                >
                  + Keranjang
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
