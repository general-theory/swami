'use client';
import { useState } from 'react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Omit<Team, 'id'>) => void;
}

interface Team {
  id: string;
  providerId: string;
  name: string;
  conference: string;
  mascot: string;
  abbreviation: string;
  division: string;
  logo: string;
  rank?: number;
}

export default function CreateTeamModal({ isOpen, onClose, onSave }: CreateTeamModalProps) {
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id'>>({
    providerId: '',
    name: '',
    conference: '',
    mascot: '',
    abbreviation: '',
    division: '',
    logo: '',
    rank: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newTeam);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({
      ...prev,
      [name]: name === 'rank' ? (value === '' ? undefined : parseInt(value)) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Create Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Provider ID</label>
            <input
              type="text"
              name="providerId"
              value={newTeam.providerId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={newTeam.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Conference</label>
            <input
              type="text"
              name="conference"
              value={newTeam.conference}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Mascot</label>
            <input
              type="text"
              name="mascot"
              value={newTeam.mascot}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Abbreviation</label>
            <input
              type="text"
              name="abbreviation"
              value={newTeam.abbreviation}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Division</label>
            <input
              type="text"
              name="division"
              value={newTeam.division}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={newTeam.logo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Rank</label>
            <input
              type="number"
              name="rank"
              value={newTeam.rank || ''}
              onChange={handleChange}
              placeholder="Enter team rank (optional)"
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 