'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditSeasonModal from '../../components/admin/EditSeasonModal';
import CreateSeasonModal from '../../components/admin/CreateSeasonModal';

interface Season {
  id: number;
  name: string;
  year: number;
  active: boolean;
}

export default function SeasonsAdmin() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null);

  useEffect(() => {
    const checkAdminAndFetchSeasons = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchSeasons();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchSeasons();
  }, [router]);

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

  const handleEdit = (season: Season) => {
    setSelectedSeason(season);
    setIsEditModalOpen(true);
  };

  const handleDelete = (season: Season) => {
    setSeasonToDelete(season);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedSeason: Season) => {
    try {
      const response = await fetch(`/api/admin/seasons/${updatedSeason.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSeason),
      });

      if (!response.ok) {
        throw new Error('Failed to update season');
      }

      await fetchSeasons();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating season:', error);
    }
  };

  const handleCreateSave = async (season: { name: string; year: number; active: boolean }) => {
    try {
      const response = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(season),
      });

      if (!response.ok) {
        throw new Error('Failed to create season');
      }

      await fetchSeasons();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating season:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!seasonToDelete) return;
    try {
      const response = await fetch(`/api/admin/seasons/${seasonToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete season');
      }

      await fetchSeasons();
      setIsDeleteModalOpen(false);
      setSeasonToDelete(null);
    } catch (error) {
      console.error('Error deleting season:', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Year', accessor: 'year' },
    { header: 'Active', accessor: 'active' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Seasons</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Season
        </button>
      </div>
      <DataTable
        columns={columns}
        data={seasons}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={() => {
          setIsDeleteModalOpen(false);
          setSeasonToDelete(null);
        }}
      />
      {selectedSeason && (
        <EditSeasonModal
          season={selectedSeason}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSeason(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateSeasonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
} 