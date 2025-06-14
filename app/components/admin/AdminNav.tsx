'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="space-y-2">
        <Link
          href="/admin"
          className={`block px-4 py-2 rounded ${
            isActive('/admin') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/users"
          className={`block px-4 py-2 rounded ${
            isActive('/admin/users') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Users
        </Link>
        <Link
          href="/admin/seasons"
          className={`block px-4 py-2 rounded ${
            isActive('/admin/seasons') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Seasons
        </Link>
        <Link
          href="/admin/leagues"
          className={`block px-4 py-2 rounded ${
            isActive('/admin/leagues') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Leagues
        </Link>
        <Link
          href="/admin/games"
          className={`block px-4 py-2 rounded ${
            isActive('/admin/games') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Games
        </Link>
      </div>
    </nav>
  );
} 