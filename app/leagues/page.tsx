'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "../components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Available Leagues
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join leagues to compete with other players and track your performance
          </p>
        </div>

        {/* Leagues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {leagues.map((league) => (
            <Card key={league.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {league.name}
                  </CardTitle>
                  {league.isParticipating && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Joined
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {league.description}
                </p>
                <div className="flex justify-end pt-2">
                  {league.isParticipating ? (
                    <Button
                      onClick={() => handleAction(league, 'leave')}
                      variant="destructive"
                      size="sm"
                      className="group-hover:scale-105 transition-transform bg-red-600 hover:bg-red-700 text-white"
                    >
                      Leave League
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAction(league, 'join')}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-105 transition-transform"
                    >
                      Join League
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {leagues.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏈</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Leagues Available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Check back later for new leagues to join.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {action === 'join' ? 'Join League' : 'Leave League'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to {action} <span className="font-semibold">{selectedLeague?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={action === 'join' ? 'default' : 'destructive'}
              className={action === 'join' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 