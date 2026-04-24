'use client';

import { motion } from 'framer-motion';

export function CookingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Pot Animation */}
      <div className="relative">
        {/* Steam */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-6 bg-gray-400/50 rounded-full"
              animate={{ y: [-5, -20], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
        
        {/* Pot */}
        <motion.div 
          className="text-6xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🍳
        </motion.div>
      </div>
      
      <p className="mt-4 text-lg font-medium text-gray-600">Sedang Memasak...</p>
    </div>
  );
}

export function OrderCompletedAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-6xl"
      >
        🎉
      </motion.div>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-xl font-bold text-green-600"
      >
        Pesanan Selesai!
      </motion.p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: string; label: string; color: string }> = {
    pending: { icon: '⏳', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    processing: { icon: '👨‍🍳', label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
    completed: { icon: '✅', label: 'Selesai', color: 'bg-green-100 text-green-800' },
    rejected: { icon: '❌', label: 'Ditolak', color: 'bg-red-100 text-red-800' },
  };
  
  const { icon, label, color } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {icon} {label}
    </span>
  );
}

export default CookingAnimation;
