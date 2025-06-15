"use client";

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { Toaster } from '../../components/ui/toaster';
import CreateGameModal from '../../components/admin/CreateGameModal';
import EditGameModal from '../../components/admin/EditGameModal';
import DeleteGameModal from '../../components/admin/DeleteGameModal';
import { Game, GameCreateData } from '../../types/game';
import { Team, Week, Season } from '@prisma/client';

export default function GamesAdmin() {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  useEffect(() => {
    fetchGames();
    fetchTeams();
    fetchWeeks();
    fetchSeasons();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/admin/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchWeeks = async () => {
    try {
      const response = await fetch('/api/admin/weeks');
      if (!response.ok) throw new Error('Failed to fetch weeks');
      const data = await response.json();
      setWeeks(data);
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

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

  const handleSync = async () => {
    try {
      const response = await fetch('/api/admin/games/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync games');
      }

      const data = await response.json();
      
      toast({
        title: "Sync Complete",
        description: `Added ${data.added} new games and updated ${data.updated} existing games.`,
        variant: "default",
      });

      // Refresh the games list
      fetchGames();
    } catch (error) {
      console.error('Error syncing games:', error);
      toast({
        title: "Sync Failed",
        description: "There was an error syncing games. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (game: Game) => {
    setSelectedGame(game);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSave = async (gameData: GameCreateData) => {
    try {
      const response = await fetch('/api/admin/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      setIsCreateModalOpen(false);
      fetchGames();
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleEditSave = async (updatedGame: Game) => {
    try {
      const response = await fetch(`/api/admin/games/${updatedGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGame),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      setIsEditModalOpen(false);
      setSelectedGame(null);
      fetchGames();
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGame) return;

    try {
      const response = await fetch(`/api/admin/games/${selectedGame.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      toast({
        title: "Game deleted",
        description: "The game has been successfully deleted.",
      });

      setIsDeleteModalOpen(false);
      setSelectedGame(null);
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete the game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredGames = games.filter(game => {
    const selectedSeasonId = selectedSeason === 'all' ? null : parseInt(selectedSeason, 10);
    const selectedWeekId = selectedWeek === 'all' ? null : parseInt(selectedWeek, 10);
    const selectedTeamId = selectedTeam === 'all' ? null : selectedTeam;

    const seasonMatch = selectedSeasonId === null || game.seasonId === selectedSeasonId;
    const weekMatch = selectedWeekId === null || game.weekId === selectedWeekId;
    const teamMatch = selectedTeamId === null || 
      game.homeId === selectedTeamId || 
      game.awayId === selectedTeamId;
    
    return seasonMatch && weekMatch && teamMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Games</h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Game
            </button>
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Sync Games
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg">
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Season
            </label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">
              Week
            </label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Weeks</option>
              {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  Week {week.week}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              id="team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Home Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Away Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(game.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teams.find(t => t.id === game.homeId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teams.find(t => t.id === game.awayId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.completed ? `${game.homePoints} - ${game.awayPoints}` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.venue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(game)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(game)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      {selectedGame && (
        <>
          <EditGameModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedGame(null);
            }}
            onSave={handleEditSave}
            game={selectedGame}
          />
          <DeleteGameModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedGame(null);
            }}
            onConfirm={handleDeleteConfirm}
            game={selectedGame}
          />
        </>
      )}

      <Toaster />
    </div>
  );
} 