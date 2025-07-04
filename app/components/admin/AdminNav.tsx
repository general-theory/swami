'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/users', label: 'Users', icon: UsersIcon },
    { href: '/admin/teams', label: 'Teams', icon: UsersIcon },
    { href: '/admin/seasons', label: 'Seasons', icon: CalendarIcon },
    { href: '/admin/weeks', label: 'Weeks', icon: CalendarIcon },
    { href: '/admin/games', label: 'Games', icon: TrophyIcon },
    { href: '/admin/leagues', label: 'Leagues', icon: TrophyIcon },
    { href: '/admin/participations', label: 'Participations', icon: UsersIcon },
    { href: '/admin/wagers', label: 'Wagers', icon: CurrencyDollarIcon },
    { href: '/admin/weekly-processing', label: 'Weekly Processing', icon: CogIcon },
  ];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded ${
              isActive(item.href) ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
} 