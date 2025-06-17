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
  [key: string]: unknown;
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
    { header: 'Name', accessorKey: 'name' },
    { header: 'Year', accessorKey: 'year' },
    { header: 'Active', accessorKey: 'active' },
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && seasonToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Delete Season</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete the season &quot;{seasonToDelete.name}&quot;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSeasonToDelete(null);
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