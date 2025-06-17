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
  [key: string]: unknown;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateSave = async (newWeek: any) => {
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
    { header: 'Season', accessorKey: 'seasonName' },
    { header: 'Week', accessorKey: 'week' },
    { header: 'Start Date', accessorKey: 'startDate' },
    { header: 'End Date', accessorKey: 'endDate' },
    { header: 'Wagers Allowed', accessorKey: 'wagersAllowed' },
    { header: 'Wagers Cutoff', accessorKey: 'wagersCutoff' },
    { header: 'Active', accessorKey: 'active' },
    { header: 'Active Sync', accessorKey: 'activeSync' },
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && weekToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Delete Week</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete Week {weekToDelete.week}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setWeekToDelete(null);
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