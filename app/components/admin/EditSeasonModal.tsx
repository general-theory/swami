'use client';
import { useState, useEffect } from 'react';

interface Season {
  id: number;
  name: string;
  year: number;
  active: boolean;
}

interface EditSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (season: Season) => void;
  season: Season;
}

export default function EditSeasonModal({ season, isOpen, onClose, onSave }: EditSeasonModalProps) {
  const [formData, setFormData] = useState<Season | null>(season);

  useEffect(() => {
    setFormData(season);
  }, [season]);

  if (!isOpen || !season) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        id: parseInt(formData.id.toString())
      });
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                name === 'year' ? parseInt(value) : value
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Season</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData?.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Year</label>
            <input
              type="number"
              name="year"
              value={formData?.year || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData?.active || false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Active</label>
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