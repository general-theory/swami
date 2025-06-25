'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditTeamModal from '../../components/admin/EditTeamModal';
import CreateTeamModal from '../../components/admin/CreateTeamModal';
import { useToast } from '../../components/ui/use-toast';

interface Team {
  id: string;
  providerId: string;
  name: string;
  conference: string;
  mascot: string;
  abbreviation: string;
  division: string;
  logo: string;
  rank?: number;
  [key: string]: unknown;
}

export default function TeamsAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingRankings, setIsSyncingRankings] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchTeams = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchTeams();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchTeams();
  }, [router]);

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

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/teams/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync teams');
      }

      const result = await response.json();
      toast({
        title: "Sync Completed",
        description: `${result.added} teams added, ${result.updated} teams updated`,
      });
      fetchTeams();
    } catch (error) {
      console.error('Error syncing teams:', error);
      toast({
        title: "Error",
        description: "Error syncing teams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncRankings = async () => {
    if (isSyncingRankings) return;
    
    setIsSyncingRankings(true);
    try {
      const response = await fetch('/api/admin/teams/sync-rankings', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync rankings');
      }

      const result = await response.json();
      
      if (result.updated > 0 || result.cleared > 0) {
        toast({
          title: "Rankings Sync Completed",
          description: `${result.updated} teams updated, ${result.cleared} teams cleared`,
        });
      } else {
        toast({
          title: "No Changes",
          description: result.message || "No changes made",
        });
      }
      
      fetchTeams();
    } catch (error) {
      console.error('Error syncing rankings:', error);
      toast({
        title: "Error",
        description: "Error syncing rankings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingRankings(false);
    }
  };

  const handleSave = async (updatedTeam: Team) => {
    try {
      const response = await fetch(`/api/admin/teams/${updatedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTeam),
      });

      if (!response.ok) {
        throw new Error('Failed to update team');
      }

      await fetchTeams();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleCreateSave = async (newTeam: Omit<Team, 'id'>) => {
    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      await fetchTeams();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;
    try {
      const response = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      await fetchTeams();
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Conference', accessorKey: 'conference' },
    { header: 'Mascot', accessorKey: 'mascot' },
    { header: 'Abbreviation', accessorKey: 'abbreviation' },
    { header: 'Division', accessorKey: 'division' },
    { header: 'Rank', accessorKey: 'rank' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Teams</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Team
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-4 py-2 text-white rounded hover:bg-green-700 inline-flex items-center space-x-2 ${
              isSyncing 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600'
            }`}
          >
            {isSyncing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
          <button
            onClick={handleSyncRankings}
            disabled={isSyncingRankings}
            className={`px-4 py-2 text-white rounded hover:bg-purple-700 inline-flex items-center space-x-2 ${
              isSyncingRankings 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600'
            }`}
          >
            {isSyncingRankings && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSyncingRankings ? 'Syncing Rankings...' : 'Sync Rankings'}</span>
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={teams}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTeam(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && teamToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Delete Team</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete the team &quot;{teamToDelete.name}&quot;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTeamToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 