'use client';

import { motion } from 'framer-motion';

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
  logo?: string;
}

const bankAccounts: BankAccount[] = [
  {
    bank: 'Bank BCA',
    accountNumber: '1234567890',
    accountHolder: 'PT FoodStore Indonesia',
  },
  {
    bank: 'Bank Mandiri',
    accountNumber: '0987654321',
    accountHolder: 'PT FoodStore Indonesia',
  },
  {
    bank: 'Bank BNI',
    accountNumber: '1122334455',
    accountHolder: 'PT FoodStore Indonesia',
  },
];

export default function PaymentInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 md:p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pembayaran</h2>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-700">
            Silakan transfer ke salah satu rekening di bawah ini. Pesanan akan diproses setelah pembayaran dikonfirmasi.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {bankAccounts.map((account, index) => (
          <motion.div
            key={account.bank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-gray-100 rounded-xl p-4 hover:border-[#03AC0E] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{account.bank}</p>
                <p className="text-lg font-mono font-bold text-[#03AC0E] mt-1 tracking-wider">
                  {account.accountNumber}
                </p>
                <p className="text-sm text-gray-500">{account.accountHolder}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(account.accountNumber)}
                className="p-2 text-gray-400 hover:text-[#03AC0E] hover:bg-[#03AC0E]/10 rounded-lg transition-colors"
                title="Copy nomor rekening"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Catatan:</span> Harap transfer sesuai dengan total pembayaran (termasuk 3 digit terakhir) untuk memudahkan verifikasi.
        </p>
      </div>
    </motion.div>
  );
}
