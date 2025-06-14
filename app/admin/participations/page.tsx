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
    { header: 'League', accessor: 'league.name' },
    { header: 'Season', accessor: 'season.name' },
    { header: 'Year', accessor: 'season.year' },
    { header: 'User', accessor: 'user.email' },
    { header: 'Balance', accessor: 'balance' },
    { header: 'Active', accessor: 'active' },
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
        isDeleteModalOpen={isDeleteModalOpen}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={() => {
          setIsDeleteModalOpen(false);
          setParticipationToDelete(null);
        }}
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
    </div>
  );
} 