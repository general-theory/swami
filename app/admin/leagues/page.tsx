'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditLeagueModal from '../../components/admin/EditLeagueModal';
import CreateLeagueModal from '../../components/admin/CreateLeagueModal';

interface League {
  id: number;
  name: string;
  description: string;
  active: boolean;
  [key: string]: unknown;
}

export default function LeaguesAdmin() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);

  useEffect(() => {
    const checkAdminAndFetchLeagues = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchLeagues();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchLeagues();
  }, [router]);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/admin/leagues');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleEdit = (league: League) => {
    setSelectedLeague(league);
    setIsEditModalOpen(true);
  };

  const handleDelete = (league: League) => {
    setLeagueToDelete(league);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedLeague: League) => {
    try {
      const response = await fetch(`/api/admin/leagues/${updatedLeague.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLeague),
      });

      if (!response.ok) {
        throw new Error('Failed to update league');
      }

      await fetchLeagues();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating league:', error);
    }
  };

  const handleCreateSave = async (newLeague: { name: string; description: string; active: boolean }) => {
    try {
      const response = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeague),
      });

      if (!response.ok) {
        throw new Error('Failed to create league');
      }

      await fetchLeagues();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leagueToDelete) return;
    try {
      const response = await fetch(`/api/admin/leagues/${leagueToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete league');
      }

      await fetchLeagues();
      setIsDeleteModalOpen(false);
      setLeagueToDelete(null);
    } catch (error) {
      console.error('Error deleting league:', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Active', accessor: 'active' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Leagues</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create League
        </button>
      </div>
      <DataTable
        columns={columns}
        data={leagues}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={() => {
          setIsDeleteModalOpen(false);
          setLeagueToDelete(null);
        }}
      />
      {selectedLeague && (
        <EditLeagueModal
          league={selectedLeague}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLeague(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateLeagueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
} 