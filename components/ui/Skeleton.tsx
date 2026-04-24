'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export default function Skeleton({
  className,
  width,
  height,
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        circle && 'rounded-full',
        !circle && 'rounded-lg',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm">
      <Skeleton className="w-full aspect-square rounded-xl mb-3" />
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-1/2 h-3 mb-3" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
