'use client';
import { useEffect, useState } from 'react';

interface Week {
  id: number;
  week: number;
  seasonId: number;
}

interface Season {
  id: number;
  name: string;
  year: number;
}

interface Team {
  id: string;
  name: string;
  mascot: string;
}

interface Game {
  id?: number;
  providerGameId: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  homeId: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayPoints: number | null;
  resultId: string | null;
  venue: string;
}

interface GameFormData {
  providerGameId: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  homeId: string;
  homePoints: number | null;
  spread: number | null;
  startingSpread: number | null;
  awayId: string;
  awayPoints: number | null;
  resultId: string | null;
  venue: string;
}

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Game) => void;
}

export default function CreateGameModal({ isOpen, onClose, onSave }: CreateGameModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    providerGameId: null,
    seasonId: 0,
    weekId: 0,
    startDate: '',
    completed: false,
    neutralSite: false,
    homeId: '',
    homePoints: null,
    spread: null,
    startingSpread: null,
    awayId: '',
    awayPoints: null,
    resultId: null,
    venue: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [seasonsRes, teamsRes] = await Promise.all([
        fetch('/api/admin/seasons'),
        fetch('/api/admin/teams'),
      ]);

      if (!seasonsRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [seasonsData, teamsData] = await Promise.all([
        seasonsRes.json(),
        teamsRes.json(),
      ]);

      setSeasons(seasonsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchWeeksForSeason = async (seasonId: number) => {
    try {
      const response = await fetch(`/api/admin/weeks?seasonId=${seasonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weeks');
      }
      const weeksData = await response.json();
      setWeeks(weeksData);
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'seasonId') {
      const seasonId = Number(value);
      setSelectedSeasonId(seasonId);
      if (seasonId) {
        await fetchWeeksForSeason(seasonId);
      } else {
        setWeeks([]);
      }
    }
    
    if (name === 'homePoints' || name === 'awayPoints' || name === 'spread' || name === 'startingSpread' || name === 'providerGameId') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      seasonId: Number(formData.seasonId),
      weekId: Number(formData.weekId),
      homeId: formData.homeId.toString(),
      awayId: formData.awayId.toString(),
      resultId: formData.resultId ? formData.resultId.toString() : null,
      spread: formData.spread ? Number(formData.spread) : null,
      startingSpread: formData.startingSpread ? Number(formData.startingSpread) : null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Create Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Provider Game ID</span>
              </label>
              <input
                type="number"
                name="providerGameId"
                value={formData.providerGameId === null ? '' : formData.providerGameId}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Provider Game ID"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Season</span>
              </label>
              <select
                name="seasonId"
                value={formData.seasonId}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="">Select Season</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Week</label>
            <select
              name="weekId"
              value={formData.weekId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedSeasonId}
            >
              <option value="">Select a week</option>
              {weeks.map((week) => (
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
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
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
          <div>
            <label className="block text-sm font-medium text-gray-300">Home Team</label>
            <select
              name="homeId"
              value={formData.homeId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.mascot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Home Points</label>
            <input
              type="number"
              name="homePoints"
              value={formData.homePoints ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Spread</label>
            <input
              type="number"
              name="spread"
              step="0.5"
              value={formData.spread ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Starting Spread</label>
            <input
              type="number"
              name="startingSpread"
              step="0.5"
              value={formData.startingSpread ?? ''}
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
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.mascot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Away Points</label>
            <input
              type="number"
              name="awayPoints"
              value={formData.awayPoints ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Result ID</label>
            <select
              name="resultId"
              value={formData.resultId === null ? '' : formData.resultId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select winning team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.mascot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
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