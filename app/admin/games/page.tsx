"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { Toaster } from '../../components/ui/toaster';
import CreateGameModal from '../../components/admin/CreateGameModal';
import EditGameModal from '../../components/admin/EditGameModal';
import DeleteGameModal from '../../components/admin/DeleteGameModal';
import { GameCreateData } from '../../types/game';
import { Team, Week, Season } from '@prisma/client';
import DataTable from '../../components/admin/DataTable';
import { columns } from './columns';

export interface GameWithRelations {
  id: number;
  providerGameId: number;
  seasonId: number;
  weekId: number;
  startDate: string;
  active: boolean;
  awayId: string;
  awayPoints: number;
  awayTeam: {
    id: string;
    name: string;
  };
  completed: boolean;
  createdAt: string;
  homeId: string;
  homePoints: number;
  homeTeam: {
    id: string;
    name: string;
  };
  neutralSite: boolean;
  resultId: number | null;
  season: {
    id: number;
    name: string;
  };
  spread: number | null;
  startingSpread: number | null;
  updatedAt: string;
  venue: string;
  week: {
    id: number;
    week: number;
  };
}

export default function GamesAdmin() {
  const { toast } = useToast();
  const [games, setGames] = useState<GameWithRelations[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameWithRelations | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingSpreads, setIsSyncingSpreads] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch games');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchGames();
    fetchTeams();
    fetchSeasons();
    fetchWeeks();
  }, [fetchGames]);

  const handleSync = async () => {
    if (isSyncing) return; // Prevent double-clicks
    
    // Check if season and week are selected
    if (selectedSeason === 'all' || selectedWeek === 'all') {
      toast({
        title: "Selection Required",
        description: "Please select a specific season and week before syncing games.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/games/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId: selectedSeason,
          weekId: selectedWeek,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync games');
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
        description: error instanceof Error ? error.message : "There was an error syncing games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSpreads = async () => {
    if (isSyncingSpreads) return; // Prevent double-clicks
    
    setIsSyncingSpreads(true);
    try {
      const response = await fetch('/api/admin/games/sync-spreads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId: selectedSeason,
          weekId: selectedWeek,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync spreads');
      }

      const data = await response.json();
      
      toast({
        title: "Sync Complete",
        description: `Updated spreads for ${data.updated} games.`,
        variant: "default",
      });

      // Refresh the games list
      fetchGames();
    } catch (error) {
      console.error('Error syncing spreads:', error);
      toast({
        title: "Sync Failed",
        description: "There was an error syncing spreads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingSpreads(false);
    }
  };

  const handleEdit = (game: GameWithRelations) => {
    setSelectedGame(game);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (game: GameWithRelations) => {
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

  const handleEditSave = async (updatedGame: GameWithRelations) => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
              disabled={isSyncing || selectedSeason === 'all' || selectedWeek === 'all'}
              className={`px-4 py-2 text-white rounded inline-flex items-center space-x-2 ${
                isSyncing || selectedSeason === 'all' || selectedWeek === 'all'
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSyncing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSyncing ? 'Syncing...' : 'Sync Games'}</span>
            </button>
            <button
              onClick={handleSyncSpreads}
              disabled={isSyncingSpreads}
              className={`px-4 py-2 text-white rounded inline-flex items-center space-x-2 ${
                isSyncingSpreads 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSyncingSpreads && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSyncingSpreads ? 'Syncing Spreads...' : 'Sync Spreads'}</span>
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <strong>Note:</strong> To sync games, please select a specific season and week from the filters below. 
          This will sync only the games for that specific week, making the process much faster.
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
          <DataTable
            columns={columns}
            data={filteredGames}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
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