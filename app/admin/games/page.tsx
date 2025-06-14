'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditGameModal from '../../components/admin/EditGameModal';
import CreateGameModal from '../../components/admin/CreateGameModal';
import { Game, GameCreateData } from '../../types/game';
import { useToast } from '../../components/ui/use-toast';
import { Toast } from '../../components/ui/toast';
import { Team, Week, Season } from '@prisma/client';
import { Toaster } from '../../components/ui/toaster';

export default function GamesAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    const checkAdminAndFetchGames = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchGames();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchGames();
  }, [router]);

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

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsEditModalOpen(true);
  };

  const handleDelete = (game: Game) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
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

  const handleSave = async (updatedGame: Game) => {
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

      await fetchGames();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleCreateSave = async (newGame: GameCreateData) => {
    try {
      const response = await fetch('/api/admin/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      await fetchGames();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;
    try {
      const response = await fetch(`/api/admin/games/${gameToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      await fetchGames();
      setIsDeleteModalOpen(false);
      setGameToDelete(null);
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const columns = [
    { header: 'Provider ID', accessor: 'providerGameId' },
    { header: 'Season', accessor: 'seasonName' },
    { header: 'Week', accessor: 'weekNumber' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'Home Team', accessor: 'homeTeam' },
    { header: 'Home Points', accessor: 'homePoints' },
    { header: 'Spread', accessor: 'spread' },
    { header: 'Opening Spread', accessor: 'startingSpread' },
    { header: 'Away Team', accessor: 'awayTeam' },
    { header: 'Away Points', accessor: 'awayPoints' },
    { header: 'Venue', accessor: 'venue' },
    { header: 'Completed', accessor: 'completed' },
    { header: 'Neutral Site', accessor: 'neutralSite' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Games</h1>
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <button
              onClick={handleCreate}
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
        <DataTable
          columns={columns}
          data={games}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleteModalOpen={isDeleteModalOpen}
          onDeleteConfirm={handleDeleteConfirm}
          onDeleteCancel={() => {
            setIsDeleteModalOpen(false);
            setGameToDelete(null);
          }}
        />
        {selectedGame && (
          <EditGameModal
            game={selectedGame}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedGame(null);
            }}
            onSave={handleSave}
          />
        )}
        <CreateGameModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateSave}
        />
      </div>
    </div>
  );
} 