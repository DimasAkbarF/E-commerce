'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'promo' | 'bestseller' | 'new' | 'discount' | 'outlined';
  className?: string;
}

export default function Badge({ children, variant = 'promo', className }: BadgeProps) {
  const variants = {
    promo: 'bg-red-500 text-white',
    bestseller: 'bg-amber-500 text-white',
    new: 'bg-blue-500 text-white',
    discount: 'bg-red-600 text-white font-bold',
    outlined: 'border border-gray-300 text-gray-600 bg-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
