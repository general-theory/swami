'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';

interface Week {
  id: number;
  week: number;
  seasonId: number;
  active: boolean;
}

export default function WeeklyProcessing() {
  const [loading, setLoading] = useState(false);
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const { toast } = useToast();

  // Fetch active week on component mount
  useEffect(() => {
    fetchActiveWeek();
  }, []);

  const fetchActiveWeek = async () => {
    try {
      const response = await fetch('/api/admin/weeks');
      if (response.ok) {
        const weeks = await response.json();
        const active = weeks.find((week: Week) => week.active);
        setActiveWeek(active || null);
      }
    } catch (error) {
      console.error('Error fetching active week:', error);
    }
  };

  const processCompletedGames = async () => {
    if (!activeWeek) {
      toast({
        title: "Error",
        description: "No active week found. Please ensure there is an active week.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/weekly-processing/process-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber: activeWeek.week,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Successfully processed completed games for Week ${activeWeek.week}. ${result.message || ''}`,
        });
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to process completed games');
      }
    } catch (error) {
      console.error('Error processing completed games:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process completed games',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Weekly Processing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Process completed games and update results for the current week
        </p>
      </div>

      <div className="grid gap-6">
        {/* Active Week Info */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Current Active Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeWeek ? (
              <div className="flex items-center gap-4">
                <div className="text-3xl">📅</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Week {activeWeek.week}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Week ID: {activeWeek.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="text-gray-600 dark:text-gray-300">
                  No active week found. Please set an active week first.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Games Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Process Completed Games
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              This will run the stored procedure to update game results for Week {activeWeek?.week || 'N/A'}. 
              This process will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>Update game completion status</li>
              <li>Calculate final scores and spreads</li>
              <li>Determine winning teams</li>
              <li>Update wager results and balance impacts</li>
            </ul>
            
            <div className="pt-4">
              <Button
                onClick={processCompletedGames}
                disabled={loading || !activeWeek}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="text-xl mr-2">⚡</span>
                    Process Completed Games
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                <strong>When to use:</strong> Run this process after all games for the current week have completed 
                and final scores have been updated in the database.
              </p>
              <p>
                <strong>What it does:</strong> The stored procedure will automatically process all completed games 
                for the active week, update wager results, and calculate balance impacts for all participants.
              </p>
              <p>
                <strong>Important:</strong> This process should only be run once per week after all games are final. 
                Running it multiple times may cause duplicate processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 