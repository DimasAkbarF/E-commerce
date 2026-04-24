'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  href: string;
}

interface PromoSectionProps {
  promos?: PromoCard[];
}

const defaultPromos: PromoCard[] = [
  {
    id: '1',
    title: 'Flash Sale',
    subtitle: 'Diskon 50%',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    bgColor: '#EF4444',
    href: '#flash-sale',
  },
  {
    id: '2',
    title: 'Gratis Ongkir',
    subtitle: 'Min. 100rb',
    image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400',
    bgColor: '#03AC0E',
    href: '#free-ongkir',
  },
  {
    id: '3',
    title: 'Cashback',
    subtitle: '10% Kembali',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
    bgColor: '#F59E0B',
    href: '#cashback',
  },
  {
    id: '4',
    title: 'Bundle Deal',
    subtitle: 'Beli 2 Gratis 1',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
    bgColor: '#8B5CF6',
    href: '#bundle',
  },
];

export default function PromoSection({ promos = defaultPromos }: PromoSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-4 md:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 5.5c0 .177.014.348.04.512l-1.052 7.33a1 1 0 00.992 1.144H12zm-2 7h2v2h-2v-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#1F1F1F]">Promo Spesial</h2>
            <p className="text-xs md:text-sm text-gray-500">Penawaran terbaik hanya untukmu</p>
          </div>
        </div>
        <Link href="#all-promos" className="text-sm text-[#03AC0E] font-medium hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {promos.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link href={promo.href}>
              <div
                className="relative h-24 md:h-32 rounded-xl overflow-hidden"
                style={{ backgroundColor: promo.bgColor }}
              >
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover opacity-40"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4">
                  <h3 className="text-white font-bold text-lg md:text-xl">{promo.title}</h3>
                  <p className="text-white/90 text-sm">{promo.subtitle}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
