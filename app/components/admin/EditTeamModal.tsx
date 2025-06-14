'use client';
import { useState } from 'react';

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

interface EditTeamModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Team) => void;
}

export default function EditTeamModal({ team, isOpen, onClose, onSave }: EditTeamModalProps) {
  const [editedTeam, setEditedTeam] = useState<Team>(team);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedTeam);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Edit Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider ID</label>
            <input
              type="text"
              value={editedTeam.providerId}
              onChange={(e) => setEditedTeam({ ...editedTeam, providerId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editedTeam.name}
              onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Conference</label>
            <input
              type="text"
              value={editedTeam.conference}
              onChange={(e) => setEditedTeam({ ...editedTeam, conference: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mascot</label>
            <input
              type="text"
              value={editedTeam.mascot}
              onChange={(e) => setEditedTeam({ ...editedTeam, mascot: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Abbreviation</label>
            <input
              type="text"
              value={editedTeam.abbreviation}
              onChange={(e) => setEditedTeam({ ...editedTeam, abbreviation: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Division</label>
            <input
              type="text"
              value={editedTeam.division}
              onChange={(e) => setEditedTeam({ ...editedTeam, division: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="text"
              value={editedTeam.logo}
              onChange={(e) => setEditedTeam({ ...editedTeam, logo: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 