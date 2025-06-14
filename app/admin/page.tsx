'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  users: number;
  seasons: number;
  leagues: number;
  games: number;
  teams: number;
  weeks: number;
  participations: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    seasons: 0,
    leagues: 0,
    games: 0,
    teams: 0,
    weeks: 0,
    participations: 0
  });

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        const statsResponse = await fetch('/api/admin/stats');
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchStats();
  }, [router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
        </Link>
        <Link href="/admin/seasons" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Seasons</h2>
            <p className="text-3xl font-bold">{stats.seasons}</p>
          </div>
        </Link>
        <Link href="/admin/leagues" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Leagues</h2>
            <p className="text-3xl font-bold">{stats.leagues}</p>
          </div>
        </Link>
        <Link href="/admin/games" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Games</h2>
            <p className="text-3xl font-bold">{stats.games}</p>
          </div>
        </Link>
        <Link href="/admin/teams" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Teams</h2>
            <p className="text-3xl font-bold">{stats.teams}</p>
          </div>
        </Link>
        <Link href="/admin/weeks" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Weeks</h2>
            <p className="text-3xl font-bold">{stats.weeks}</p>
          </div>
        </Link>
        <Link href="/admin/participations" className="block">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Participations</h2>
            <p className="text-3xl font-bold">{stats.participations}</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 