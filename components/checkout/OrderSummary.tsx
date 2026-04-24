'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Ringkasan Pesanan</h2>
        <Link href="/cart" className="text-sm text-[#03AC0E] hover:underline">
          Edit
        </Link>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {items.map((item, index) => {
          if (!item) return null;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {/* Image */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Total Item</span>
          <span>{itemCount} pcs</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Ongkir</span>
          <span className="text-[#03AC0E]">Gratis</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 mt-3 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total Pembayaran</span>
          <span className="text-xl font-bold text-[#EF4444]">{formatPrice(total)}</span>
        </div>
      </div>
    </motion.div>
  );
}
