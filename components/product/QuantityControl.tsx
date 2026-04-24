'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}: QuantityControlProps) {
  const sizes = {
    sm: {
      container: 'h-7',
      button: 'w-7 h-7',
      icon: 'w-3 h-3',
      input: 'w-8 text-xs',
    },
    md: {
      container: 'h-9',
      button: 'w-9 h-9',
      icon: 'w-4 h-4',
      input: 'w-10 text-sm',
    },
    lg: {
      container: 'h-11',
      button: 'w-11 h-11',
      icon: 'w-5 h-5',
      input: 'w-12 text-base',
    },
  };

  const s = sizes[size];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange?.(value);
    }
  };

  return (
    <div className={cn('flex items-center bg-gray-100 rounded-xl overflow-hidden', s.container)}>
      <motion.button
        whileHover={!disabled && quantity > min ? { scale: 1.1 } : {}}
        whileTap={!disabled && quantity > min ? { scale: 0.9 } : {}}
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className={cn(
          'flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors',
          s.button,
          (disabled || quantity <= min) && 'opacity-40 cursor-not-allowed'
        )}
      >
        <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </motion.button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          'bg-transparent text-center font-semibold text-gray-900 focus:outline-none',
          s.input,
          disabled && 'opacity-60'
        )}
      />

      <motion.button
        whileHover={!disabled && quantity < max ? { scale: 1.1 } : {}}
        whileTap={!disabled && quantity < max ? { scale: 0.9 } : {}}
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        className={cn(
          'flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors',
          s.button,
          (disabled || quantity >= max) && 'opacity-40 cursor-not-allowed'
        )}
      >
        <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>
    </div>
  );
}
