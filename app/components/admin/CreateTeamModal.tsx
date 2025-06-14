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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newTeam);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-white">Create New Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Provider ID</label>
            <input
              type="text"
              value={newTeam.providerId}
              onChange={(e) => setNewTeam({ ...newTeam, providerId: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Conference</label>
            <input
              type="text"
              value={newTeam.conference}
              onChange={(e) => setNewTeam({ ...newTeam, conference: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Mascot</label>
            <input
              type="text"
              value={newTeam.mascot}
              onChange={(e) => setNewTeam({ ...newTeam, mascot: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Abbreviation</label>
            <input
              type="text"
              value={newTeam.abbreviation}
              onChange={(e) => setNewTeam({ ...newTeam, abbreviation: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Division</label>
            <input
              type="text"
              value={newTeam.division}
              onChange={(e) => setNewTeam({ ...newTeam, division: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Logo URL</label>
            <input
              type="text"
              value={newTeam.logo}
              onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
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