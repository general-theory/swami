'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface League {
  id: number;
  name: string;
}

interface WeekOption {
  id: number;
  week: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string | null;
  email: string;
}

interface Game {
  id: number;
  weekId: number;
  seasonId: number;
  homeTeam: { id: number; name: string; };
  awayTeam: { id: number; name: string; };
  spread: number | null;
  homePoints: number | null;
  awayPoints: number | null;
  startDate: string;
}

interface Wager {
  userId: number;
  gameId: number;
  pick: 'home' | 'visit';
  amount: number;
}

export default function Results() {
  const { isSignedIn } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [loadingWeeks, setLoadingWeeks] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      try {
        const res = await fetch("/api/leagues/active");
        if (!res.ok) throw new Error("Failed to fetch leagues");
        const data = await res.json();
        setLeagues(data);
        if (data.length > 0) setSelectedLeagueId(data[0].id);
      } catch (e) {
        console.error('Error fetching leagues:', e);
        setLeagues([]);
      } finally {
        setLoadingLeagues(false);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchWeeks = async () => {
      setLoadingWeeks(true);
      try {
        const res = await fetch("/api/weeks");
        if (!res.ok) throw new Error("Failed to fetch weeks");
        const data = await res.json();
        setWeeks(data);
        if (data.length > 0) setSelectedWeekId(data[0].id);
      } catch (e) {
        console.error('Error fetching weeks:', e);
        setWeeks([]);
      } finally {
        setLoadingWeeks(false);
      }
    };
    fetchWeeks();
  }, []);


  if (!isSignedIn) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-4xl font-bold whitespace-nowrap">Latest Results</h1>
        <div className="flex-1" />
        <div className="flex gap-2">
          <div>
            <label className="sr-only" htmlFor="league-select">Select League</label>
            <select
              id="league-select"
              className="select select-primary select-sm min-w-[160px]"
              value={selectedLeagueId ?? ''}
              onChange={e => setSelectedLeagueId(Number(e.target.value)) }
              disabled={loadingLeagues || leagues.length === 0}
            >
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="week-select">Select Week</label>
            <select
              id="week-select"
              className="select select-primary select-sm min-w-[120px]"
              value={selectedWeekId ?? ''}
              onChange={e => setSelectedWeekId(Number(e.target.value))}
              disabled={loadingWeeks || weeks.length === 0}
            >
              {weeks.map(week => (
                <option key={week.id} value={week.id}>Week {week.week}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <p className="text-xl">Recent match results will appear here.</p>
        </div>
      </div>
      <ResultsTable leagueId={selectedLeagueId} weekId={selectedWeekId} />
    </div>
  );
}

function ResultsTable({ leagueId, weekId }: { leagueId: number | null; weekId: number | null }) {
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId || !weekId) return;
    setLoading(true);
    const fetchAll = async () => {
      // Fetch games for week
      const gamesRes = await fetch(`/api/games/${weekId}`);
      const gamesData = await gamesRes.json();
      setGames(gamesData);
      // Fetch users for league/season
      const seasonId = gamesData[0]?.seasonId;
      const usersRes = await fetch(`/api/participations?leagueId=${leagueId}&seasonId=${seasonId}`);
      const usersData = await usersRes.json();
      setUsers(usersData);
      // Fetch wagers for league/week
      const wagersRes = await fetch(`/api/wagers/all?weekId=${weekId}&leagueId=${leagueId}`);
      const wagersData = await wagersRes.json();
      setWagers(wagersData);
      setLoading(false);
    };
    fetchAll();
  }, [leagueId, weekId]);

  if (loading) return <div className="text-center py-8">Loading results...</div>;
  if (!games.length || !users.length) return <div className="text-center py-8">No results found.</div>;

  // Build table
  // ...header rows: spread, scores, teams...
  // ...user rows: wagers per game, row total...
  // ...final row: total wagered per team...

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-center">
        <thead>
          <tr>
            <th className="bg-gray-200"></th>
            {games.map(game => (
              <th key={game.id} className="bg-gray-200 font-bold">{game.spread ?? ''}</th>
            ))}
            <th className="bg-gray-200 font-bold">Total</th>
          </tr>
          <tr>
            <th className="bg-gray-100"></th>
            {games.map(game => (
              <th key={game.id} className="bg-gray-100">{game.awayPoints ?? ''} - {game.homePoints ?? ''}</th>
            ))}
            <th className="bg-gray-100"></th>
          </tr>
          <tr>
            <th className="bg-gray-50"></th>
            {games.map(game => (
              <th key={game.id} className="bg-gray-50">
                <span className="text-black">{game.awayTeam.name}</span> <span className="text-xs text-gray-400">@</span> <span className="text-blue-700 font-bold">{game.homeTeam.name}</span>
              </th>
            ))}
            <th className="bg-gray-50"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const rowTotal = games.reduce((sum, game) => {
              const wager = wagers.find(w => w.userId === user.id && w.gameId === game.id);
              return sum + (wager ? wager.amount : 0);
            }, 0);
            return (
              <tr key={user.id}>
                <td className="font-bold text-left whitespace-nowrap">{user.nickName || `${user.firstName} ${user.lastName}`}</td>
                {games.map(game => {
                  const wager = wagers.find(w => w.userId === user.id && w.gameId === game.id);
                  return (
                    <td key={game.id} className={wager ? 'text-red-600 font-semibold' : ''}>{wager ? wager.amount : ''}</td>
                  );
                })}
                <td className="font-bold">{rowTotal}</td>
              </tr>
            );
          })}
          {/* Final row: total wagered per game */}
          <tr>
            <td className="font-bold">Total</td>
            {games.map(game => {
              const total = wagers.filter(w => w.gameId === game.id).reduce((sum, w) => sum + w.amount, 0);
              return <td key={game.id} className="font-bold">{total}</td>;
            })}
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 