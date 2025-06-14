'use client';
import { useState, useEffect } from 'react';

interface Season {
  id: number;
  name: string;
  year: number;
}

interface Week {
  id: number;
  week: number;
  seasonId: number;
}

interface Team {
  id: string;
  name: string;
  abbreviation: string;
}

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Game) => void;
  game: Game;
}

interface Game {
  id: number;
  seasonId: number;
  seasonName: string;
  weekId: number;
  weekNumber: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  homeId: string;
  homeTeam: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayTeam: string;
  awayPoints: number | null;
  resultId: string | null;
  resultTeam: string | null;
  venue: string;
}

export default function EditGameModal({ game, isOpen, onClose, onSave }: EditGameModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState<Game>({
    ...game,
    startDate: new Date(game.startDate).toISOString().slice(0, 16)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seasonsRes, teamsRes] = await Promise.all([
          fetch('/api/admin/seasons'),
          fetch('/api/admin/teams')
        ]);

        if (!seasonsRes.ok || !teamsRes.ok) throw new Error('Failed to fetch data');
        
        const [seasonsData, teamsData] = await Promise.all([
          seasonsRes.json(),
          teamsRes.json()
        ]);

        setSeasons(seasonsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
      setFormData({
        ...game,
        startDate: new Date(game.startDate).toISOString().slice(0, 16)
      });
    }
  }, [isOpen, game]);

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!formData.seasonId) return;
      
      try {
        const response = await fetch(`/api/admin/weeks?seasonId=${formData.seasonId}`);
        if (!response.ok) throw new Error('Failed to fetch weeks');
        const data = await response.json();
        setWeeks(data);
      } catch (error) {
        console.error('Error fetching weeks:', error);
      }
    };

    fetchWeeks();
  }, [formData.seasonId]);

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
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Game</h2>
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
              <option value="">Select a season</option>
              {seasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Week</label>
            <select
              name="weekId"
              value={formData.weekId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a week</option>
              {weeks.map(week => (
                <option key={week.id} value={week.id}>
                  Week {week.week}
                </option>
              ))}
            </select>
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
            <label className="block text-sm font-medium text-gray-300">Home Team</label>
            <select
              name="homeId"
              value={formData.homeId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select home team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.abbreviation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Home Points</label>
            <input
              type="number"
              name="homePoints"
              value={formData.homePoints || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Away Team</label>
            <select
              name="awayId"
              value={formData.awayId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select away team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.abbreviation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Away Points</label>
            <input
              type="number"
              name="awayPoints"
              value={formData.awayPoints || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Spread</label>
            <input
              type="number"
              name="spread"
              value={formData.spread || ''}
              onChange={handleChange}
              step="0.1"
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Starting Spread</label>
            <input
              type="number"
              name="startingSpread"
              value={formData.startingSpread || ''}
              onChange={handleChange}
              step="0.1"
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Result Team</label>
            <select
              name="resultId"
              value={formData.resultId || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select result team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.abbreviation})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="neutralSite"
              checked={formData.neutralSite}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Neutral Site</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="completed"
              checked={formData.completed}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label className="ml-2 block text-sm text-gray-300">Completed</label>
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