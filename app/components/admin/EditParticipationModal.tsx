'use client';
import { useEffect, useState } from 'react';

interface League {
  id: number;
  name: string;
  active: boolean;
}

interface Season {
  id: number;
  name: string;
  year: number;
  active: boolean;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Participation {
  id: number;
  leagueId: number;
  seasonId: number;
  userId: number;
  active: boolean;
  balance: number;
  league: {
    name: string;
  };
  season: {
    name: string;
    year: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  [key: string]: unknown;
}

interface EditParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participation: Participation) => void;
  participation: Participation;
}

export default function EditParticipationModal({
  participation,
  isOpen,
  onClose,
  onSave,
}: EditParticipationModalProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Participation>(participation);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, seasonsRes, usersRes] = await Promise.all([
          fetch('/api/admin/leagues'),
          fetch('/api/admin/seasons'),
          fetch('/api/admin/users'),
        ]);

        const [leaguesData, seasonsData, usersData] = await Promise.all([
          leaguesRes.json(),
          seasonsRes.json(),
          usersRes.json(),
        ]);

        // Sort active items first
        const sortedLeagues = [...leaguesData].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
        const sortedSeasons = [...seasonsData].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));

        setLeagues(sortedLeagues);
        setSeasons(sortedSeasons);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Participation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">League</label>
            <select
              value={formData.leagueId}
              onChange={(e) => setFormData({ ...formData, leagueId: Number(e.target.value) })}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name} {league.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Season</label>
            <select
              value={formData.seasonId}
              onChange={(e) => setFormData({ ...formData, seasonId: Number(e.target.value) })}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.year}) {season.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.firstName} {user.lastName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-300">Active</label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 