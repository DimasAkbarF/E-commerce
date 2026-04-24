'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-[#1F1F1F] mb-4">Kategori</h2>
      
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          >
            <Link
              href={`/category/${category.id}`}
              className="flex flex-col items-center gap-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl transition-shadow"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <span>{category.icon}</span>
              </motion.div>
              <span className="text-xs md:text-sm text-center text-gray-700 group-hover:text-[#03AC0E] transition-colors line-clamp-2">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
