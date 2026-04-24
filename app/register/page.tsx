'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo, just show success and redirect
    // In production, this would create a real user
    setIsLoading(false);
    
    // Show coming soon message for demo
    setError('Fitur registrasi demo - gunakan akun demo di halaman login');
    
    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-[#03AC0E] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <span className="text-2xl font-bold text-[#03AC0E]">FoodStore</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Daftar untuk mulai berbelanja
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3 mb-4 ${
                error.includes('demo')
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p className={`text-sm text-center ${
                error.includes('demo') ? 'text-blue-600' : 'text-red-600'
              }`}>
                {error}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                  errors.name
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-[#03AC0E]'
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="Masukkan email"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                  errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-[#03AC0E]'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="Minimal 6 karakter"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-[#03AC0E]'
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder="Masukkan ulang password"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-[#03AC0E]'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Daftar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-[#03AC0E] font-medium hover:underline"
              >
                Masuk sekarang
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
