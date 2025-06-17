'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditParticipationModal from '../../components/admin/EditParticipationModal';
import CreateParticipationModal from '../../components/admin/CreateParticipationModal';

interface Participation {
  id: number;
  leagueId: number;
  seasonId: number;
  userId: number;
  active: boolean;
  balance: number;
  league: {
    name: string;
  };
  season: {
    name: string;
    year: number;
  };
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  [key: string]: unknown;
}

export default function ParticipationsAdmin() {
  const router = useRouter();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participationToDelete, setParticipationToDelete] = useState<Participation | null>(null);

  useEffect(() => {
    const checkAdminAndFetchParticipations = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchParticipations();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchParticipations();
  }, [router]);

  const fetchParticipations = async () => {
    try {
      const response = await fetch('/api/admin/participations');
      if (!response.ok) throw new Error('Failed to fetch participations');
      const data = await response.json();
      setParticipations(data);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const handleEdit = (participation: Participation) => {
    setSelectedParticipation(participation);
    setIsEditModalOpen(true);
  };

  const handleDelete = (participation: Participation) => {
    setParticipationToDelete(participation);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedParticipation: Participation) => {
    try {
      const response = await fetch(`/api/admin/participations/${updatedParticipation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedParticipation),
      });

      if (!response.ok) {
        throw new Error('Failed to update participation');
      }

      await fetchParticipations();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating participation:', error);
    }
  };

  const handleCreateSave = async (participation: { leagueId: number; seasonId: number; userId: number; active: boolean; balance: number }) => {
    try {
      const response = await fetch('/api/admin/participations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participation),
      });

      if (!response.ok) {
        throw new Error('Failed to create participation');
      }

      await fetchParticipations();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating participation:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!participationToDelete) return;
    try {
      const response = await fetch(`/api/admin/participations/${participationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete participation');
      }

      await fetchParticipations();
      setIsDeleteModalOpen(false);
      setParticipationToDelete(null);
    } catch (error) {
      console.error('Error deleting participation:', error);
    }
  };

  const columns = [
    { header: 'League', accessorKey: 'league.name' },
    { header: 'Season', accessorKey: 'season.name' },
    { header: 'Year', accessorKey: 'season.year' },
    { header: 'User', accessorKey: 'user.email' },
    { header: 'Balance', accessorKey: 'balance' },
    { header: 'Active', accessorKey: 'active' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Participations</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Participation
        </button>
      </div>
      <DataTable
        columns={columns}
        data={participations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {selectedParticipation && (
        <EditParticipationModal
          participation={selectedParticipation}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedParticipation(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateParticipationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && participationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Delete Participation</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this participation? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setParticipationToDelete(null);
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