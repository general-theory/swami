'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditCommissionerModal from '../../components/admin/EditCommissionerModal';
import CreateCommissionerModal from '../../components/admin/CreateCommissionerModal';

interface Commissioner {
  id: number;
  leagueId: number;
  userId: number;
  league: { id: number; name: string };
  user: { id: number; firstName: string; lastName: string; nickName: string | null; email: string };
  [key: string]: unknown;
}

export default function CommissionersAdmin() {
  const router = useRouter();
  const [commissioners, setCommissioners] = useState<Commissioner[]>([]);
  const [selectedCommissioner, setSelectedCommissioner] = useState<Commissioner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();

        if (!userData?.admin) {
          router.push('/');
          return;
        }

        fetchCommissioners();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetch();
  }, [router]);

  const fetchCommissioners = async () => {
    try {
      const response = await fetch('/api/admin/commissioners');
      if (!response.ok) throw new Error('Failed to fetch commissioners');
      const data = await response.json();
      setCommissioners(data);
    } catch (error) {
      console.error('Error fetching commissioners:', error);
    }
  };

  const handleEdit = (commissioner: Commissioner) => {
    setSelectedCommissioner(commissioner);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (commissioner: Commissioner) => {
    try {
      const response = await fetch(`/api/admin/commissioners/${commissioner.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete commissioner');
      }

      await fetchCommissioners();
    } catch (error) {
      console.error('Error deleting commissioner:', error);
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedCommissioner: Commissioner) => {
    try {
      const response = await fetch(`/api/admin/commissioners/${updatedCommissioner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCommissioner),
      });

      if (!response.ok) {
        throw new Error('Failed to update commissioner');
      }

      await fetchCommissioners();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating commissioner:', error);
    }
  };

  const handleCreateSave = async (newCommissioner: { leagueId: number; userId: number }) => {
    try {
      const response = await fetch('/api/admin/commissioners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommissioner),
      });

      if (!response.ok) {
        throw new Error('Failed to create commissioner');
      }

      await fetchCommissioners();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating commissioner:', error);
    }
  };

  const columns = [
    { header: 'League', accessorKey: 'league.name' },
    {
      header: 'Commissioner',
      cell: ({ row }: { row: { original: Commissioner } }) => {
        const u = row.original.user;
        return u.nickName || `${u.firstName} ${u.lastName}`.trim() || u.email;
      },
    },
    { header: 'Email', accessorKey: 'user.email' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Commissioners</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Commissioner
        </button>
      </div>
      <DataTable
        columns={columns}
        data={commissioners}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {selectedCommissioner && (
        <EditCommissionerModal
          commissioner={selectedCommissioner}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCommissioner(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateCommissionerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
}
