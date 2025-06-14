'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditWeekModal from '../../components/admin/EditWeekModal';
import CreateWeekModal from '../../components/admin/CreateWeekModal';

interface Week {
  id: number;
  seasonId: number;
  seasonName: string;
  week: number;
  startDate: string;
  endDate: string;
  wagersAllowed: boolean;
  wagersCutoff: string;
  active: boolean;
  activeSync: boolean;
}

export default function WeeksAdmin() {
  const router = useRouter();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<Week | null>(null);

  useEffect(() => {
    const checkAdminAndFetchWeeks = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchWeeks();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetchWeeks();
  }, [router]);

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

  const handleEdit = (week: Week) => {
    setSelectedWeek(week);
    setIsEditModalOpen(true);
  };

  const handleDelete = (week: Week) => {
    setWeekToDelete(week);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedWeek: Week) => {
    try {
      const response = await fetch(`/api/admin/weeks/${updatedWeek.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWeek),
      });

      if (!response.ok) {
        throw new Error('Failed to update week');
      }

      await fetchWeeks();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating week:', error);
    }
  };

  const handleCreateSave = async (newWeek: Week) => {
    try {
      const response = await fetch('/api/admin/weeks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWeek),
      });

      if (!response.ok) {
        throw new Error('Failed to create week');
      }

      await fetchWeeks();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating week:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!weekToDelete) return;
    try {
      const response = await fetch(`/api/admin/weeks/${weekToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete week');
      }

      await fetchWeeks();
      setIsDeleteModalOpen(false);
      setWeekToDelete(null);
    } catch (error) {
      console.error('Error deleting week:', error);
    }
  };

  const columns = [
    { header: 'Season', accessor: 'seasonName' },
    { header: 'Week', accessor: 'week' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate' },
    { header: 'Wagers Allowed', accessor: 'wagersAllowed' },
    { header: 'Wagers Cutoff', accessor: 'wagersCutoff' },
    { header: 'Active', accessor: 'active' },
    { header: 'Active Sync', accessor: 'activeSync' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Weeks</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Week
        </button>
      </div>
      <DataTable
        columns={columns}
        data={weeks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={() => {
          setIsDeleteModalOpen(false);
          setWeekToDelete(null);
        }}
      />
      {selectedWeek && (
        <EditWeekModal
          week={selectedWeek}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedWeek(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateWeekModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
} 