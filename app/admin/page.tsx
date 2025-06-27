'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UsersIcon, TagIcon, CalendarIcon, CalendarDaysIcon, TrophyIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  users: number;
  seasons: number;
  leagues: number;
  games: number;
  teams: number;
  weeks: number;
  participations: number;
  wagers: number;
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
    participations: 0,
    wagers: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          if (response.status === 403) {
            router.push('/');
          }
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    checkAdminAndFetchStats();
  }, [router]);

  const cards = [
    {
      title: 'Users',
      description: 'Manage user accounts and permissions',
      href: '/admin/users',
      icon: UsersIcon,
      count: stats.users,
    },
    {
      title: 'Teams',
      description: 'Manage college football teams',
      href: '/admin/teams',
      icon: TagIcon,
      count: stats.teams,
    },
    {
      title: 'Seasons',
      description: 'Manage football seasons',
      href: '/admin/seasons',
      icon: CalendarIcon,
      count: stats.seasons,
    },
    {
      title: 'Weeks',
      description: 'Manage season weeks',
      href: '/admin/weeks',
      icon: CalendarDaysIcon,
      count: stats.weeks,
    },
    {
      title: 'Games',
      description: 'Manage football games',
      href: '/admin/games',
      icon: TrophyIcon,
      count: stats.games,
    },
    {
      title: 'Leagues',
      description: 'Manage betting leagues',
      href: '/admin/leagues',
      icon: TrophyIcon,
      count: stats.leagues,
    },
    {
      title: 'Participations',
      description: 'Manage league participations',
      href: '/admin/participations',
      icon: UsersIcon,
      count: stats.participations,
    },
    {
      title: 'Wagers',
      description: 'Manage user wagers',
      href: '/admin/wagers',
      icon: BanknotesIcon,
      count: stats.wagers,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <card.icon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                <p className="text-gray-600">{card.description}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{card.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 