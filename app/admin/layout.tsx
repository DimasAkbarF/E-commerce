'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useIsolatedSession } from '@/hooks/useIsolatedSession';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  
  // ISOLATED SESSION - COMPLETELY ISOLATED per tab
  // This tab's session NEVER changes when other tabs login/logout
  const { role, isLoading, initialized, isAuthenticated, hasAccess } = useIsolatedSession('admin');

  // STEP 1: Show loading while session is loading or not initialized
  // CRITICAL: NEVER block or redirect while loading === true
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
          <p className="text-gray-500 text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  // STEP 2: If not authenticated, show login prompt (no auto-redirect)
  // CRITICAL: This tab stays on this page even if other tabs are logged in
  if (!isAuthenticated && initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-6">
            Silakan login sebagai Admin untuk mengakses halaman ini.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ke Beranda
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-[#03AC0E] text-white rounded-lg hover:bg-[#028a0b] transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: If initialized but role is not admin, show access denied
  // This tab stays on this page - just shows warning
  if (initialized && !hasAccess && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 mb-2">
            Anda login sebagai <strong className="capitalize">{role || 'Guest'}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Halaman Admin hanya dapat diakses oleh user dengan role Admin.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ke Pesanan Saya
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-[#03AC0E] text-white rounded-lg hover:bg-[#028a0b] transition-colors"
            >
              Login sebagai Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: Admin access granted
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">Dashboard Admin</h1>

            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#03AC0E] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">A</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
