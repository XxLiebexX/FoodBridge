'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'DONOR':
        router.push('/dashboard/donor');
        break;
      case 'NGO':
        router.push('/dashboard/ngo');
        break;
      case 'VOLUNTEER':
        router.push('/dashboard/volunteer');
        break;
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/dashboard/donor');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
