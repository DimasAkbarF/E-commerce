import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing orders and analytics',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  redirect('/admin/dashboard');
}
