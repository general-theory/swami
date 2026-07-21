'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '../../components/admin/DataTable';
import EditChampionModal from '../../components/admin/EditChampionModal';
import CreateChampionModal from '../../components/admin/CreateChampionModal';

interface Champion {
  id: number;
  leagueId: number;
  userId: number;
  seasonId: number;
  photoUrl: string;
  league: { id: number; name: string };
  user: { id: number; firstName: string; lastName: string; nickName: string | null; email: string };
  season: { id: number; year: number };
  [key: string]: unknown;
}

export default function ChampionsAdmin() {
  const router = useRouter();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
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

        fetchChampions();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminAndFetch();
  }, [router]);

  const fetchChampions = async () => {
    try {
      const response = await fetch('/api/admin/champions');
      if (!response.ok) throw new Error('Failed to fetch champions');
      const data = await response.json();
      setChampions(data);
    } catch (error) {
      console.error('Error fetching champions:', error);
    }
  };

  const handleEdit = (champion: Champion) => {
    setSelectedChampion(champion);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (champion: Champion) => {
    try {
      const response = await fetch(`/api/admin/champions/${champion.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete champion');
      }

      await fetchChampions();
    } catch (error) {
      console.error('Error deleting champion:', error);
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedChampion: Champion) => {
    try {
      const response = await fetch(`/api/admin/champions/${updatedChampion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedChampion),
      });

      if (!response.ok) {
        throw new Error('Failed to update champion');
      }

      await fetchChampions();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating champion:', error);
    }
  };

  const handleCreateSave = async (newChampion: { leagueId: number; userId: number; seasonId: number; photoUrl: string }) => {
    try {
      const response = await fetch('/api/admin/champions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChampion),
      });

      if (!response.ok) {
        throw new Error('Failed to create champion');
      }

      await fetchChampions();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating champion:', error);
    }
  };

  const columns = [
    { header: 'League', accessorKey: 'league.name' },
    { header: 'Year', accessorKey: 'season.year' },
    {
      header: 'Champion',
      cell: ({ row }: { row: { original: Champion } }) => {
        const u = row.original.user;
        return u.nickName || `${u.firstName} ${u.lastName}`.trim() || u.email;
      },
    },
    {
      header: 'Photo',
      cell: ({ row }: { row: { original: Champion } }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.original.photoUrl} alt="Champion" className="h-10 w-10 rounded object-cover" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Champions</h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crown a Champion
        </button>
      </div>
      <DataTable
        columns={columns}
        data={champions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {selectedChampion && (
        <EditChampionModal
          champion={selectedChampion}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedChampion(null);
          }}
          onSave={handleSave}
        />
      )}
      <CreateChampionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
}
