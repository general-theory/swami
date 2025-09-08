'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';

interface Week {
  id: number;
  week: number;
  seasonId: number;
  active: boolean;
}

interface PlayerWithBets {
  userId: string;
  userName: string;
  leagueId: number;
  leagueName: string;
  balance: number;
  minBet: number;
  currentBetTotal: number;
  shortfall: number;
}

interface GameForSelection {
  id: number;
  awayTeam: {
    name: string;
    rank: number | null;
  };
  homeTeam: {
    name: string;
    rank: number | null;
  };
  spread: number | null;
  active: boolean;
}

export default function WeeklyProcessing() {
  const [loading, setLoading] = useState(false);
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const [defaultBetsData, setDefaultBetsData] = useState<PlayerWithBets[]>([]);
  const [loadingDefaultBets, setLoadingDefaultBets] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [addingDefaultBets, setAddingDefaultBets] = useState(false);
  const [gamesForSelection, setGamesForSelection] = useState<GameForSelection[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
  const [loadingGames, setLoadingGames] = useState(false);
  const [updatingActiveGames, setUpdatingActiveGames] = useState(false);
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

  const fetchDefaultBetsData = useCallback(async () => {
    setLoadingDefaultBets(true);
    try {
      const response = await fetch('/api/admin/weekly-processing/default-bets');
      if (response.ok) {
        const data = await response.json();
        setDefaultBetsData(data);
      } else {
        console.error('Failed to fetch default bets data');
        setDefaultBetsData([]);
      }
    } catch (error) {
      console.error('Error fetching default bets data:', error);
      setDefaultBetsData([]);
    } finally {
      setLoadingDefaultBets(false);
    }
  }, []);

  const fetchGamesForSelection = useCallback(async () => {
    if (!activeWeek) return;
    
    setLoadingGames(true);
    try {
      const response = await fetch(`/api/admin/games?weekId=${activeWeek.id}`);
      if (response.ok) {
        const data = await response.json();
        setGamesForSelection(data);
        // Initialize selected games with currently active games
        const activeGameIds = new Set(data.filter((game: GameForSelection) => game.active).map((game: GameForSelection) => game.id));
        setSelectedGames(activeGameIds as Set<number>);
      } else {
        console.error('Failed to fetch games for selection');
        setGamesForSelection([]);
      }
    } catch (error) {
      console.error('Error fetching games for selection:', error);
      setGamesForSelection([]);
    } finally {
      setLoadingGames(false);
    }
  }, [activeWeek]);

  // Fetch default bets data when active week changes
  useEffect(() => {
    if (activeWeek) {
      fetchDefaultBetsData();
      fetchGamesForSelection();
    }
  }, [activeWeek, fetchDefaultBetsData, fetchGamesForSelection]);

  const sendEmailReminders = async () => {
    if (defaultBetsData.length === 0) {
      toast({
        title: "No Reminders Needed",
        description: "All players have met their minimum bet requirements.",
      });
      return;
    }

    setSendingReminders(true);
    try {
      const response = await fetch('/api/admin/weekly-processing/send-reminders', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Reminders Sent",
          description: result.message,
        });
        // Refresh the data to show updated status
        await fetchDefaultBetsData();
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending email reminders:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send email reminders',
        variant: "destructive",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  const addDefaultBets = async () => {
    if (defaultBetsData.length === 0) {
      toast({
        title: "No Default Bets Needed",
        description: "All players have met their minimum bet requirements.",
      });
      return;
    }

    setAddingDefaultBets(true);
    try {
      const response = await fetch('/api/admin/weekly-processing/add-default-bets', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Default Bets Added",
          description: result.message,
        });
        // Refresh the data to show updated status
        await fetchDefaultBetsData();
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to add default bets');
      }
    } catch (error) {
      console.error('Error adding default bets:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add default bets',
        variant: "destructive",
      });
    } finally {
      setAddingDefaultBets(false);
    }
  };

  const handleGameSelection = (gameId: number) => {
    const newSelectedGames = new Set(selectedGames);
    if (newSelectedGames.has(gameId)) {
      newSelectedGames.delete(gameId);
    } else {
      if (newSelectedGames.size >= 16) {
        toast({
          title: "Maximum Games Selected",
          description: "You can only select up to 16 games.",
          variant: "destructive",
        });
        return;
      }
      newSelectedGames.add(gameId);
    }
    setSelectedGames(newSelectedGames);
  };

  const updateActiveGames = async () => {
    if (!activeWeek) {
      toast({
        title: "Error",
        description: "No active week found.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingActiveGames(true);
    try {
      const response = await fetch('/api/admin/weekly-processing/update-active-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekId: activeWeek.id,
          selectedGameIds: Array.from(selectedGames),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Active Games Updated",
          description: result.message,
        });
        // Refresh the games data
        await fetchGamesForSelection();
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to update active games');
      }
    } catch (error) {
      console.error('Error updating active games:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update active games',
        variant: "destructive",
      });
    } finally {
      setUpdatingActiveGames(false);
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
      console.log('active week is', activeWeek.week);
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

        {/* Pick Active Games Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Pick Active Games
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Select up to 16 games for Week {activeWeek?.week || 'N/A'} that players can wager on:
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {selectedGames.size} of 16 games selected
              </div>
              <Button
                onClick={updateActiveGames}
                disabled={updatingActiveGames || selectedGames.size === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                {updatingActiveGames ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Update Active Games
                  </>
                )}
              </Button>
            </div>
            
            {loadingGames ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : gamesForSelection.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <th className="px-4 py-2 text-left w-12">Select</th>
                      <th className="px-4 py-2 text-left">Visit Team</th>
                      <th className="px-4 py-2 text-center">Spread</th>
                      <th className="px-4 py-2 text-left">Home Team</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gamesForSelection.map((game) => (
                      <tr 
                        key={game.id} 
                        className={`border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedGames.has(game.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleGameSelection(game.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedGames.has(game.id)}
                            onChange={() => handleGameSelection(game.id)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                          {game.awayTeam.rank && (
                            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">#{game.awayTeam.rank}</span>
                          )}
                          {game.awayTeam.name}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-900 dark:text-white">
                          {game.spread !== null ? (game.spread >= 0 ? `+${game.spread}` : game.spread.toString()) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                          {game.homeTeam.rank && (
                            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">#{game.homeTeam.rank}</span>
                          )}
                          {game.homeTeam.name}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            game.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {game.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                <div className="text-4xl mb-2">📋</div>
                <p>No games found for this week.</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                onClick={fetchGamesForSelection}
                disabled={loadingGames}
                variant="outline"
                size="sm"
              >
                {loadingGames ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔄</span>
                    Refresh Games
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Process Default Bets Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Process Default Bets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Players who have not met their minimum bet requirement for Week {activeWeek?.week || 'N/A'}:
            </p>
            
            {defaultBetsData.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {defaultBetsData.length} player(s) need reminders
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addDefaultBets}
                    disabled={addingDefaultBets}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="sm"
                  >
                    {addingDefaultBets ? (
                      <>
                        <div className="loading loading-spinner loading-sm mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💰</span>
                        Add Default Bets
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={sendEmailReminders}
                    disabled={sendingReminders}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    size="sm"
                  >
                    {sendingReminders ? (
                      <>
                        <div className="loading loading-spinner loading-sm mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📧</span>
                        Send Email Reminder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {loadingDefaultBets ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : defaultBetsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">League</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                      <th className="px-4 py-2 text-right">Min Bet</th>
                      <th className="px-4 py-2 text-right">Current Total</th>
                      <th className="px-4 py-2 text-right">Shortfall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultBetsData.map((player) => (
                      <tr key={`${player.userId}-${player.leagueId}`} className="border-b border-gray-200 dark:border-gray-600">
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{player.userName}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{player.leagueName}</td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${player.balance}</td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${player.minBet}</td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${player.currentBetTotal}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">${player.shortfall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                <div className="text-4xl mb-2">✅</div>
                <p>All players have met their minimum bet requirements!</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                onClick={fetchDefaultBetsData}
                disabled={loadingDefaultBets}
                variant="outline"
                size="sm"
              >
                {loadingDefaultBets ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔄</span>
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
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