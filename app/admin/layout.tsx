'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNav from '../components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();

        const admin = !!userData?.admin;
        const isCommissioner = Array.isArray(userData?.commissionerLeagueIds) && userData.commissionerLeagueIds.length > 0;

        if (!admin && !isCommissioner) {
          router.push('/');
          return;
        }

        // Commissioners only have access to the Leagues page; send them there directly
        if (!admin && isCommissioner && pathname === '/admin') {
          router.replace('/admin/leagues');
          return;
        }

        setIsAdmin(admin);
        setHasAccess(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAccess();
  }, [router, pathname]);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminNav isAdmin={isAdmin} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
