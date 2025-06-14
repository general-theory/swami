'use client';
import { useEffect, useState } from 'react';
import StandingsTable from '../components/StandingsTable';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Standings</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="league-filter" className="text-base font-semibold text-white">
            Filter by League:
          </label>
          <select
            id="league-filter"
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Leagues</option>
            {userLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <StandingsTable columns={columns} data={filteredStandings} />
    </div>
  );
} 