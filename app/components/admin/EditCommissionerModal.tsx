'use client';
import { useEffect, useState } from 'react';

interface League {
  id: number;
  name: string;
  active: boolean;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Commissioner {
  id: number;
  leagueId: number;
  userId: number;
  league: { id: number; name: string };
  user: { id: number; firstName: string; lastName: string; nickName: string | null; email: string };
  [key: string]: unknown;
}

interface EditCommissionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commissioner: Commissioner) => void;
  commissioner: Commissioner;
}

export default function EditCommissionerModal({
  commissioner,
  isOpen,
  onClose,
  onSave,
}: EditCommissionerModalProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Commissioner>(commissioner);

  useEffect(() => {
    setFormData(commissioner);
  }, [commissioner]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, usersRes] = await Promise.all([
          fetch('/api/admin/leagues'),
          fetch('/api/admin/users'),
        ]);

        const [leaguesData, usersData] = await Promise.all([
          leaguesRes.json(),
          usersRes.json(),
        ]);

        setLeagues(leaguesData);
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
        <h2 className="text-xl font-bold mb-4 text-white">Edit Commissioner</h2>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Commissioner</label>
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
