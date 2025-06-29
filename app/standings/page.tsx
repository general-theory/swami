'use client';
import { useEffect, useState } from 'react';
import StandingsTable from '../components/StandingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface League {
  id: number;
  name: string;
}

interface Standing {
  id: number;
  league: {
    id: number;
    name: string;
    active: boolean;
  };
  user: {
    displayName: string;
    favTeamId?: string;
    favoriteTeam?: {
      id: string;
      name: string;
      logo: string;
    };
  };
  balance: number;
  minBet: number;
  maxBet: number;
}

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [userLeagues, setUserLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const response = await fetch('/api/standings');
      if (!response.ok) throw new Error('Failed to fetch standings');
      const data = await response.json();
      
      setUserLeagues(data.userLeagues);
      
      // Filter for active leagues and sort by balance
      const filteredData = data.standings
        .filter((standing: Standing) => standing.league.active)
        .sort((a: Standing, b: Standing) => b.balance - a.balance);
      
      setStandings(filteredData);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStandings = selectedLeagueId === 'all'
    ? standings
    : standings.filter(standing => standing.league.id === selectedLeagueId);

  const columns = [
    { header: 'League', accessor: 'league.name' },
    { header: 'User', accessor: 'user.displayName' },
    { header: 'Balance', accessor: 'balance' },
    { header: 'Min Bet', accessor: 'minBet' },
    { header: 'Max Bet', accessor: 'maxBet' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Standings
            </h1>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                League:
              </label>
              <Select
                value={selectedLeagueId.toString()}
                onValueChange={(value) => setSelectedLeagueId(value === 'all' ? 'all' : Number(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a league" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {userLeagues.map((league) => (
                    <SelectItem key={league.id} value={league.id.toString()}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardContent className="p-0">
            {filteredStandings.length > 0 ? (
              <StandingsTable columns={columns} data={filteredStandings} />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Standings Available
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedLeagueId === 'all' 
                    ? 'No active leagues found. Join a league to see standings.'
                    : 'No players found in this league.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 