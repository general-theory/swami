'use client';
import { useState, useEffect } from 'react';

interface Season {
  id: number;
  name: string;
  year: number;
}

interface EditWeekModalProps {
  week: Week;
  isOpen: boolean;
  onClose: () => void;
  onSave: (week: Week) => void;
}

interface Week {
  id: number;
  seasonId: number;
  seasonName: string;
  week: number;
  startDate: string;
  endDate: string;
  wagersAllowed: boolean;
  wagersCutoff: string;
  active: boolean;
  activeSync: boolean;
}

export default function EditWeekModal({ week, isOpen, onClose, onSave }: EditWeekModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [formData, setFormData] = useState<Week>({
    ...week,
    startDate: new Date(week.startDate).toISOString().slice(0, 16),
    endDate: new Date(week.endDate).toISOString().slice(0, 16),
    wagersCutoff: new Date(week.wagersCutoff).toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/admin/seasons');
        if (!response.ok) throw new Error('Failed to fetch seasons');
        const data = await response.json();
        setSeasons(data);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };

    if (isOpen) {
      fetchSeasons();
      setFormData({
        ...week,
        startDate: new Date(week.startDate).toISOString().slice(0, 16),
        endDate: new Date(week.endDate).toISOString().slice(0, 16),
        wagersCutoff: new Date(week.wagersCutoff).toISOString().slice(0, 16),
      });
    }
  }, [isOpen, week]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Week</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Season</label>
            <select
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {seasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Week Number</label>
            <input
              type="number"
              name="week"
              value={formData.week}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Wagers Cutoff</label>
            <input
              type="datetime-local"
              name="wagersCutoff"
              value={formData.wagersCutoff}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="wagersAllowed"
              checked={formData.wagersAllowed}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Wagers Allowed</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Active</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activeSync"
              checked={formData.activeSync}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Active Sync</label>
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