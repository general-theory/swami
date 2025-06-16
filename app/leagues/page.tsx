'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "../components/ui/use-toast";

interface League {
  id: number;
  name: string;
  description: string;
  active: boolean;
  isParticipating: boolean;
}

export default function Leagues() {
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [action, setAction] = useState<'join' | 'leave' | null>(null);

  const fetchLeagues = useCallback(async () => {
    try {
      const response = await fetch('/api/leagues');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      toast({
        title: "Error",
        description: "Failed to load leagues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isSignedIn) {
      redirect("/");
    }
    fetchLeagues();
  }, [isSignedIn, fetchLeagues]);

  const handleAction = async (league: League, action: 'join' | 'leave') => {
    setSelectedLeague(league);
    setAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedLeague || !action) return;

    try {
      const response = await fetch(`/api/leagues/${selectedLeague.id}/participate`, {
        method: action === 'join' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: action === 'join' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} league`);
      }

      // Update local state
      setLeagues(leagues.map(l => 
        l.id === selectedLeague.id 
          ? { ...l, isParticipating: action === 'join' }
          : l
      ));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('leagueChange'));

      toast({
        title: "Success",
        description: `Successfully ${action === 'join' ? 'joined' : 'left'} ${selectedLeague.name}`,
      });
    } catch (error) {
      console.error(`Error ${action}ing league:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} league. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setShowConfirmModal(false);
      setSelectedLeague(null);
      setAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Leagues</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <div key={league.id} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{league.name}</h2>
              <p>{league.description}</p>
              <div className="card-actions justify-end mt-4">
                {league.isParticipating ? (
                  <button
                    onClick={() => handleAction(league, 'leave')}
                    className="btn btn-error"
                  >
                    Leave League
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(league, 'join')}
                    className="btn btn-primary"
                  >
                    Join League
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedLeague && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {action === 'join' ? 'Join League' : 'Leave League'}
            </h3>
            <p className="mb-6">
              Are you sure you want to {action} {selectedLeague.name}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`btn ${action === 'join' ? 'btn-primary' : 'btn-error'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 