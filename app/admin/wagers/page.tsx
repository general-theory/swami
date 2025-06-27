"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../components/ui/use-toast';
import DataTable from '../../components/admin/DataTable';
import { columns } from './columns';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import CreateWagerModal from './CreateWagerModal';

interface Game {
  id: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  season: {
    id: number;
    name: string;
  };
  week: {
    id: number;
    week: number;
  };
  active: boolean;
}

export interface WagerWithDetails {
  id: number;
  userId: number;
  gameId: number;
  leagueId: number;
  pick: string;
  amount: number;
  won: boolean | null;
  balanceImpact: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  game: {
    id: number;
    homeTeam: {
      id: string;
      name: string;
    };
    awayTeam: {
      id: string;
      name: string;
    };
    season: {
      id: number;
      name: string;
    };
    week: {
      id: number;
      week: number;
    };
  };
  league: {
    id: number;
    name: string;
  };
  season: {
    id: number;
    name: string;
  };
  week: {
    id: number;
    week: number;
  };
}

const queryClient = new QueryClient();

function WagersAdminContent() {
  const { toast } = useToast();
  const [wagers, setWagers] = useState<WagerWithDetails[]>([]);
  const [users, setUsers] = useState<{ id: number; firstName: string; lastName: string; }[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [leagues, setLeagues] = useState<{ id: number; name: string; }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWager, setSelectedWager] = useState<WagerWithDetails | null>(null);

  const { data: wagersData, isLoading, error: queryError } = useQuery<WagerWithDetails[], Error>({
    queryKey: ['wagers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/wagers');
      if (!response.ok) {
        throw new Error('Failed to fetch wagers');
      }
      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data, null, 2));
      console.log('First wager structure:', JSON.stringify(data[0], null, 2));
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Length:', data.length);
      return data;
    }
  });

  useEffect(() => {
    if (wagersData) {
      console.log('Setting wagers state:', JSON.stringify(wagersData, null, 2));
      console.log('First wager in state:', JSON.stringify(wagersData[0], null, 2));
      console.log('Data type:', typeof wagersData);
      console.log('Is array:', Array.isArray(wagersData));
      console.log('Length:', wagersData.length);
      setWagers(wagersData);
    }
  }, [wagersData]);

  useEffect(() => {
    if (queryError) {
      console.error('Error fetching wagers:', queryError);
      toast({
        title: "Error",
        description: "Failed to fetch wagers. Please try again.",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, []);

  const fetchLeagues = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/leagues');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchGames();
    fetchLeagues();
  }, [fetchUsers, fetchGames, fetchLeagues]);

  const handleEdit = (wager: WagerWithDetails) => {
    setSelectedWager(wager);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (wager: WagerWithDetails) => {
    try {
      const response = await fetch(`/api/admin/wagers/${wager.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete wager');
      }

      // Update the local state to remove the deleted wager
      setWagers(wagers.filter(w => w.id !== wager.id));
      
      toast({
        title: "Success",
        description: "Wager deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting wager:', error);
      toast({
        title: "Error",
        description: "Failed to delete wager. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSuccess = (newWager: WagerWithDetails) => {
    setWagers([...wagers, newWager]);
  };

  const handleEditSuccess = (updatedWager: WagerWithDetails) => {
    setWagers(wagers.map(wager => 
      wager.id === updatedWager.id ? updatedWager : wager
    ));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-400">Manage Wagers</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Wager
        </Button>
      </div>

      {isLoading ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full bg-gray-700" />
              <Skeleton className="h-8 w-full bg-gray-700" />
              <Skeleton className="h-8 w-full bg-gray-700" />
            </div>
          </CardContent>
        </Card>
      ) : queryError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load wagers. Please try again.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <DataTable<WagerWithDetails>
            columns={columns}
            data={wagers}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </>
      )}

      <CreateWagerModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
        users={users}
        games={games}
        leagues={leagues}
      />

      <CreateWagerModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleEditSuccess}
        users={users}
        games={games}
        leagues={leagues}
        wager={selectedWager || undefined}
      />
    </div>
  );
}

export default function WagersAdmin() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagersAdminContent />
    </QueryClientProvider>
  );
} 