'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomerInfo } from '@/types';

interface CustomerFormProps {
  onSubmit: (data: CustomerInfo) => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CustomerForm({ onSubmit, isLoading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^[0-9\-\+\s]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat harus diisi';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Alamat minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Auto-submit when all required fields are filled
  useEffect(() => {
    const { name, phone, address } = formData;
    if (name.trim() && phone.trim() && address.trim() && address.length >= 10) {
      onSubmit(formData);
    }
  }, [formData, onSubmit]);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-4 md:p-6 space-y-4"
    >
      <h2 className="text-lg font-bold text-gray-900">Informasi Pengiriman</h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Masukkan nama lengkap"
          disabled={isLoading}
          className={`w-full px-4 py-2.5 rounded-xl border-2 transition-colors focus:outline-none ${
            errors.name
              ? 'border-red-300 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-[#03AC0E]'
          }`}
        />
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 mt-1"
          >
            {errors.name}
          </motion.p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nomor Telepon <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
            +62
          </span>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="81234567890"
            disabled={isLoading}
            className={`w-full pl-12 pr-4 py-2.5 rounded-xl border-2 transition-colors focus:outline-none ${
              errors.phone
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-[#03AC0E]'
            }`}
          />
        </div>
        {errors.phone && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 mt-1"
          >
            {errors.phone}
          </motion.p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Alamat Lengkap <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Masukkan alamat lengkap (jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos)"
          rows={3}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 rounded-xl border-2 transition-colors focus:outline-none resize-none ${
            errors.address
              ? 'border-red-300 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-[#03AC0E]'
          }`}
        />
        {errors.address && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 mt-1"
          >
            {errors.address}
          </motion.p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Catatan (Opsional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Contoh: Rumah pojok, dekat warung hijau"
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#03AC0E] transition-colors focus:outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#03AC0E] text-white font-medium rounded-xl hover:bg-[#028a0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Menyimpan...' : 'Simpan Data Pengiriman'}
      </button>
    </motion.form>
  );
}
