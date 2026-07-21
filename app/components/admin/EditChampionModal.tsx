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

interface Champion {
  id: number;
  leagueId: number;
  userId: number;
  seasonId: number;
  photoUrl: string;
  league: { id: number; name: string };
  user: { id: number; firstName: string; lastName: string; nickName: string | null; email: string };
  season: { id: number; year: number };
  [key: string]: unknown;
}

interface EditChampionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (champion: Champion) => void;
  champion: Champion;
}

export default function EditChampionModal({
  champion,
  isOpen,
  onClose,
  onSave,
}: EditChampionModalProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Champion>(champion);

  useEffect(() => {
    setFormData(champion);
  }, [champion]);

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

        setLeagues(leaguesData);
        setSeasons([...seasonsData].sort((a: Season, b: Season) => b.year - a.year));
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
        <h2 className="text-xl font-bold mb-4 text-white">Edit Champion</h2>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Champion</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Photo URL</label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
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
