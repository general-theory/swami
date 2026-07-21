'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";

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
  balance: number;
}

function displayName(user: User): string {
  return user.nickName || `${user.firstName} ${user.lastName}`.trim() || user.email;
}

interface Game {
  id: number;
  weekId: number;
  seasonId: number;
  completed: boolean;
  homeTeam: { 
    id: number; 
    name: string; 
    logo: string | null;
  };
  awayTeam: { 
    id: number; 
    name: string; 
    logo: string | null;
  };
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
  balanceImpact: number;
}

interface GameSummary {
  game: Game;
  totalWagered: number;
  homeWagered: number;
  awayWagered: number;
  winner: 'home' | 'away' | null;
}

interface UserSummary {
  user: User;
  totalWagered: number;
  gamesWagered: number;
  balanceImpact: number;
  wins: number;
  losses: number;
  wagers: Wager[];
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

  // Check if there are no completed weeks
  if (!loadingWeeks && weeks.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold whitespace-nowrap">Week Results</h1>
        </div>
        <div className="text-center py-12">
          <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
            <div className="card-body">
              <h2 className="card-title text-xl justify-center mb-4">Results Not Available</h2>
              <p className="text-gray-600">
                No completed weeks found. Results will be available once games have finished and weeks are marked as completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold whitespace-nowrap">Week Results</h1>
        <div className="flex-1" />
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">League</label>
            <select
              className="select select-primary select-sm min-w-[180px]"
              value={selectedLeagueId ?? ''}
              onChange={e => setSelectedLeagueId(Number(e.target.value))}
              disabled={loadingLeagues || leagues.length === 0}
            >
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Week</label>
            <select
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
      
      <ResultsView
        leagueId={selectedLeagueId}
        weekId={selectedWeekId}
        weekNumber={weeks.find(w => w.id === selectedWeekId)?.week ?? null}
      />
    </div>
  );
}

function ResultsView({ leagueId, weekId, weekNumber }: { leagueId: number | null; weekId: number | null; weekNumber: number | null }) {
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  useEffect(() => {
    if (!leagueId || !weekId) return;
    
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch games for week
        const gamesRes = await fetch(`/api/games/${weekId}`);
        if (!gamesRes.ok) throw new Error('Failed to fetch games');
        const gamesData = await gamesRes.json();
        setGames(gamesData);

        // Fetch users for league/season
        const seasonId = gamesData[0]?.seasonId;
        if (seasonId) {
          const usersRes = await fetch(`/api/participations/all?leagueId=${leagueId}&seasonId=${seasonId}`);
          if (!usersRes.ok) {
            console.error('Failed to fetch users:', usersRes.status, usersRes.statusText);
            setUsers([]);
          } else {
            const usersData = await usersRes.json();
            console.log('Users data received:', usersData);
            setUsers(Array.isArray(usersData) ? usersData : []);
          }
        } else {
          setUsers([]);
        }

        // Fetch wagers for league/week
        const wagersRes = await fetch(`/api/wagers/all?weekId=${weekId}&leagueId=${leagueId}`);
        if (!wagersRes.ok) throw new Error('Failed to fetch wagers');
        const wagersData = await wagersRes.json();
        setWagers(wagersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, weekId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!leagueId || !weekId) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Select a league and week to view results</p>
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No games found for this week</p>
      </div>
    );
  }

  // Helper function to determine wager result
  const getWagerResult = (wager: Wager, game: Game) => {
    if (!game.completed || game.homePoints === null || game.awayPoints === null) {
      return null;
    }

    const homeScore = game.homePoints;
    const awayScore = game.awayPoints;
    const spread = game.spread || 0;
    
    const adjustedHomeScore = homeScore + spread;
    const homeWon = adjustedHomeScore > awayScore;
    
    const userPickedHome = wager.pick === 'home';
    const userWon = (userPickedHome && homeWon) || (!userPickedHome && !homeWon);
    
    return userWon ? 'win' : 'loss';
  };

  // Calculate game summaries
  const gameSummaries: GameSummary[] = games.map(game => {
    const gameWagers = wagers.filter(w => w.gameId === game.id);
    const homeWagered = gameWagers.filter(w => w.pick === 'home').reduce((sum, w) => sum + w.amount, 0);
    const awayWagered = gameWagers.filter(w => w.pick === 'visit').reduce((sum, w) => sum + w.amount, 0);
    
    let winner: 'home' | 'away' | null = null;
    if (game.completed && game.homePoints !== null && game.awayPoints !== null) {
      const homeScore = game.homePoints;
      const awayScore = game.awayPoints;
      const spread = game.spread || 0;
      
      // Apply spread to home team
      const adjustedHomeScore = homeScore + spread;
      winner = adjustedHomeScore > awayScore ? 'home' : 'away';
    }

    return {
      game,
      totalWagered: homeWagered + awayWagered,
      homeWagered,
      awayWagered,
      winner
    };
  });

  // Calculate user summaries
  const userSummaries: UserSummary[] = (users || []).map(user => {
    if (!user || !user.id) {
      console.warn('Invalid user object:', user);
      return null;
    }
    
    const userWagers = wagers.filter(w => w.userId === user.id);
    const totalWagered = userWagers.reduce((sum, w) => sum + w.amount, 0);
    const gamesWagered = new Set(userWagers.map(w => w.gameId)).size;
    const balanceImpact = userWagers.reduce((sum, w) => sum + w.balanceImpact, 0);

    // Calculate wins and losses
    let wins = 0;
    let losses = 0;
    userWagers.forEach(wager => {
      const game = games.find(g => g.id === wager.gameId);
      if (game) {
        const result = getWagerResult(wager, game);
        if (result === 'win') wins++;
        else if (result === 'loss') losses++;
      }
    });

    return {
      user,
      totalWagered,
      gamesWagered,
      balanceImpact,
      wins,
      losses,
      wagers: userWagers
    };
  }).filter(Boolean) as UserSummary[];

  const totalLeagueWagered = userSummaries.reduce((sum, u) => sum + u.totalWagered, 0);

  // Calculate team betting stats
  const teamBettingStats = games.reduce((acc, game) => {
    const gameWagers = wagers.filter(w => w.gameId === game.id);
    
    // Home team stats
    const homeWagers = gameWagers.filter(w => w.pick === 'home');
    const homeBetCount = homeWagers.length;
    const homeBetAmount = homeWagers.reduce((sum, w) => sum + w.amount, 0);
    
    // Away team stats
    const awayWagers = gameWagers.filter(w => w.pick === 'visit');
    const awayBetCount = awayWagers.length;
    const awayBetAmount = awayWagers.reduce((sum, w) => sum + w.amount, 0);
    
    // Update home team totals
    if (!acc[game.homeTeam.name]) {
      acc[game.homeTeam.name] = { betCount: 0, betAmount: 0 };
    }
    acc[game.homeTeam.name].betCount += homeBetCount;
    acc[game.homeTeam.name].betAmount += homeBetAmount;
    
    // Update away team totals
    if (!acc[game.awayTeam.name]) {
      acc[game.awayTeam.name] = { betCount: 0, betAmount: 0 };
    }
    acc[game.awayTeam.name].betCount += awayBetCount;
    acc[game.awayTeam.name].betAmount += awayBetAmount;
    
    return acc;
  }, {} as Record<string, { betCount: number; betAmount: number }>);

  const mostBetTeam = Object.entries(teamBettingStats).reduce((max, [team, stats]) => 
    stats.betCount > max.betCount ? { team, ...stats } : max, 
    { team: '', betCount: 0, betAmount: 0 }
  );

  const highestDollarTeam = Object.entries(teamBettingStats).reduce((max, [team, stats]) => 
    stats.betAmount > max.betAmount ? { team, ...stats } : max, 
    { team: '', betCount: 0, betAmount: 0 }
  );

  // Calculate win/loss stats
  const leagueWinLoss = userSummaries.reduce((totals, userSummary) => {
    const userWagers = userSummary.wagers;
    let wins = 0;
    let losses = 0;
    
    userWagers.forEach(wager => {
      const game = games.find(g => g.id === wager.gameId);
      if (game) {
        const result = getWagerResult(wager, game);
        if (result === 'win') wins++;
        else if (result === 'loss') losses++;
      }
    });
    
    totals.wins += wins;
    totals.losses += losses;
    return totals;
  }, { wins: 0, losses: 0 });

  const allGamesCompleted = games.length > 0 && games.every(g => g.completed);
  const wageredSummaries = userSummaries.filter(u => u.totalWagered > 0);

  // Pre-game stats
  const biggestSingleBet = wagers.reduce<{ user: User; game: Game; wager: Wager } | null>((max, wager) => {
    if (max && wager.amount <= max.wager.amount) return max;
    const user = users.find(u => u.id === wager.userId);
    const game = games.find(g => g.id === wager.gameId);
    return user && game ? { user, game, wager } : max;
  }, null);

  const contrarianTeam = Object.entries(teamBettingStats)
    .filter(([, stats]) => stats.betCount > 0)
    .reduce<{ team: string; betCount: number; betAmount: number } | null>((min, [team, stats]) =>
      (!min || stats.betCount < min.betCount) ? { team, ...stats } : min, null);

  // Post-game stats (only meaningful once every game this week has finished)
  const biggestWinner = wageredSummaries.reduce<UserSummary | null>((max, u) =>
    (!max || u.balanceImpact > max.balanceImpact) ? u : max, null);
  const biggestLoser = wageredSummaries.reduce<UserSummary | null>((min, u) =>
    (!min || u.balanceImpact < min.balanceImpact) ? u : min, null);
  const perfectWeekUsers = wageredSummaries.filter(u => u.wins > 0 && u.losses === 0);
  const worstWeekUsers = wageredSummaries.filter(u => u.losses > 0 && u.wins === 0);

  const bestUpsetCall = wagers.reduce<{ user: User; game: Game; wager: Wager; spreadMagnitude: number } | null>((best, wager) => {
    const game = games.find(g => g.id === wager.gameId);
    if (!game || game.spread === null || getWagerResult(wager, game) !== 'win') return best;
    const isHomeFavored = game.spread < 0;
    const underdogSide: 'home' | 'visit' = isHomeFavored ? 'visit' : 'home';
    if (wager.pick !== underdogSide) return best;
    const spreadMagnitude = Math.abs(game.spread);
    if (best && spreadMagnitude <= best.spreadMagnitude) return best;
    const user = users.find(u => u.id === wager.userId);
    return user ? { user, game, wager, spreadMagnitude } : best;
  }, null);

  // Rank movement: there's no per-week balance snapshot stored, so "before this week" is
  // reconstructed by backing this week's wager impact out of the user's current balance.
  // This is exact for the most recently played week, but only approximate for older ones.
  const usersWithBalance = users.filter(u => typeof u.balance === 'number');
  const previousBalances = new Map(usersWithBalance.map(u => {
    const impact = wagers.filter(w => w.userId === u.id).reduce((sum, w) => sum + w.balanceImpact, 0);
    return [u.id, u.balance - impact];
  }));
  const currentRanks = new Map(
    [...usersWithBalance].sort((a, b) => b.balance - a.balance).map((u, idx) => [u.id, idx + 1])
  );
  const previousRanks = new Map(
    [...usersWithBalance]
      .sort((a, b) => (previousBalances.get(b.id) ?? 0) - (previousBalances.get(a.id) ?? 0))
      .map((u, idx) => [u.id, idx + 1])
  );
  const rankChanges = usersWithBalance.map(u => {
    const currentRank = currentRanks.get(u.id) ?? 0;
    const previousRank = previousRanks.get(u.id) ?? currentRank;
    return { user: u, currentRank, previousRank, delta: previousRank - currentRank };
  });
  const biggestRiser = rankChanges.reduce((max, r) => (!max || r.delta > max.delta) ? r : max, null as typeof rankChanges[number] | null);
  const biggestFaller = rankChanges.reduce((min, r) => (!min || r.delta < min.delta) ? r : min, null as typeof rankChanges[number] | null);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button className="btn btn-primary btn-sm" onClick={() => setRecapOpen(true)}>
          🏆 Week {weekNumber ?? ''} Recap
        </button>
      </div>

      <WeeklyRecapModal
        open={recapOpen}
        onClose={() => setRecapOpen(false)}
        weekNumber={weekNumber}
        allGamesCompleted={allGamesCompleted}
        highestDollarTeam={highestDollarTeam}
        mostBetTeam={mostBetTeam}
        contrarianTeam={contrarianTeam}
        biggestSingleBet={biggestSingleBet}
        biggestWinner={biggestWinner}
        biggestLoser={biggestLoser}
        perfectWeekUsers={perfectWeekUsers}
        worstWeekUsers={worstWeekUsers}
        bestUpsetCall={bestUpsetCall}
        biggestRiser={biggestRiser}
        biggestFaller={biggestFaller}
      />

      {/* League Summary */}
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Wagered</div>
          <div className="stat-value text-primary">♠{totalLeagueWagered.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active Players</div>
          <div className="stat-value">{userSummaries.filter(u => u.totalWagered > 0).length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Games</div>
          <div className="stat-value">{games.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Most Bet Team</div>
          <div className="stat-value text-secondary">{mostBetTeam.team || 'N/A'}</div>
          <div className="stat-desc">{mostBetTeam.betCount} bets</div>
        </div>
        <div className="stat">
          <div className="stat-title">Highest $ Team</div>
          <div className="stat-value text-accent">{highestDollarTeam.team || 'N/A'}</div>
          <div className="stat-desc">♠{highestDollarTeam.betAmount.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">League Record</div>
          <div className="stat-value text-info">{leagueWinLoss.wins}-{leagueWinLoss.losses}</div>
          <div className="stat-desc">Wins-Losses</div>
        </div>
      </div>

      {/* Games Overview */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Games & Wagering Trends</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gameSummaries.map((summary) => (
              <GameCard key={summary.game.id} summary={summary} />
            ))}
          </div>
        </div>
      </div>

      {/* Player Results */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Player Results</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-left">Player</th>
                  <th className="text-center">Games Wagered</th>
                  <th className="text-center">Total Wagered</th>
                  <th className="text-center">Avg Per Game</th>
                  <th className="text-center">Record</th>
                  <th className="text-center">Balance Impact</th>
                </tr>
              </thead>
              <tbody>
                {userSummaries
                  .filter(u => u.totalWagered > 0)
                  .sort((a, b) => b.totalWagered - a.totalWagered)
                  .map((summary) => (
                    <tr key={summary.user.id}>
                      <td className="font-medium">
                        {summary.user.nickName || `${summary.user.firstName} ${summary.user.lastName}`}
                      </td>
                      <td className="text-center">{summary.gamesWagered}</td>
                      <td className="text-center font-semibold">♠{summary.totalWagered.toLocaleString()}</td>
                      <td className="text-center">
                        ♠{summary.gamesWagered > 0 ? Math.round(summary.totalWagered / summary.gamesWagered) : 0}
                      </td>
                      <td className="text-center font-medium">
                        <span className={`badge ${summary.wins > summary.losses ? 'badge-success' : 
                          summary.losses > summary.wins ? 'badge-error' : 'badge-neutral'}`}>
                          {summary.wins}-{summary.losses}
                        </span>
                      </td>
                      <td className={`text-center font-semibold ${
                        summary.balanceImpact > 0 ? 'text-green-600' : 
                        summary.balanceImpact < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ♠{summary.balanceImpact.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Wagers */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Individual Wagers</h2>
          <div className="space-y-4">
            {userSummaries
              .filter(u => u.totalWagered > 0)
              .map((userSummary) => (
                <UserWagersCard 
                  key={userSummary.user.id} 
                  userSummary={userSummary} 
                  games={games}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GameCard({ summary }: { summary: GameSummary }) {
  const { game, totalWagered, homeWagered, awayWagered, winner } = summary;
  const homePercentage = totalWagered > 0 ? Math.round((homeWagered / totalWagered) * 100) : 0;
  const awayPercentage = totalWagered > 0 ? Math.round((awayWagered / totalWagered) * 100) : 0;

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {game.awayTeam.logo && (
              <Image
                src={game.awayTeam.logo}
                alt={`${game.awayTeam.name} logo`}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-sm">{game.awayTeam.name}</span>
          </div>
          <span className="text-xs text-gray-500">@</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{game.homeTeam.name}</span>
            {game.homeTeam.logo && (
              <Image
                src={game.homeTeam.logo}
                alt={`${game.homeTeam.name} logo`}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
          </div>
        </div>

        <div className="text-center mb-3">
          <div className="text-lg font-bold">
            {game.awayPoints !== null && game.homePoints !== null 
              ? `${game.awayPoints} - ${game.homePoints}`
              : 'TBD'
            }
          </div>
          <div className="text-sm text-gray-600">
            Spread: {game.spread !== null ? game.spread : 'NL'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Away: ♠{awayWagered.toLocaleString()}</span>
            <span className="font-medium">{awayPercentage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Home: ♠{homeWagered.toLocaleString()}</span>
            <span className="font-medium">{homePercentage}%</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>♠{totalWagered.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {winner && (
          <div className={`mt-2 text-center text-sm font-medium ${
            winner === 'home' ? 'text-green-600' : 'text-blue-600'
          }`}>
            {winner === 'home' ? game.homeTeam.name : game.awayTeam.name} covered
          </div>
        )}
      </div>
    </div>
  );
}

function UserWagersCard({ userSummary, games }: { userSummary: UserSummary; games: Game[] }) {
  const { user, wagers } = userSummary;

  const getWagerResult = (wager: Wager, game: Game) => {
    if (!game.completed || game.homePoints === null || game.awayPoints === null) {
      return null; // Game not completed
    }

    const homeScore = game.homePoints;
    const awayScore = game.awayPoints;
    const spread = game.spread || 0;
    
    // Apply spread to home team
    const adjustedHomeScore = homeScore + spread;
    const homeWon = adjustedHomeScore > awayScore;
    
    // Determine if user's pick was correct
    const userPickedHome = wager.pick === 'home';
    const userWon = (userPickedHome && homeWon) || (!userPickedHome && !homeWon);
    
    return userWon ? 'win' : 'loss';
  };

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-3">
          {user.nickName || `${user.firstName} ${user.lastName}`}
        </h3>
        
        <div className="grid gap-2">
          {wagers.map((wager) => {
            const game = games.find(g => g.id === wager.gameId);
            if (!game) return null;

            const isHomePick = wager.pick === 'home';
            const pickedTeam = isHomePick ? game.homeTeam : game.awayTeam;
            const otherTeam = isHomePick ? game.awayTeam : game.homeTeam;
            const result = getWagerResult(wager, game);

            return (
              <div key={wager.gameId} className="flex items-center justify-between p-2 bg-base-100 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pickedTeam.name}</span>
                  <span className="text-xs text-gray-500">vs</span>
                  <span className="text-sm">{otherTeam.name}</span>
                  {result && (
                    <span className={`badge badge-sm ${
                      result === 'win' ? 'badge-success' : 'badge-error'
                    }`}>
                      {result === 'win' ? 'W' : 'L'}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">♠{wager.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {game.awayPoints !== null && game.homePoints !== null
                      ? `${game.awayPoints}-${game.homePoints}`
                      : 'Pending'
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface RankChange {
  user: User;
  currentRank: number;
  previousRank: number;
  delta: number;
}

function WeeklyRecapModal({
  open,
  onClose,
  weekNumber,
  allGamesCompleted,
  highestDollarTeam,
  mostBetTeam,
  contrarianTeam,
  biggestSingleBet,
  biggestWinner,
  biggestLoser,
  perfectWeekUsers,
  worstWeekUsers,
  bestUpsetCall,
  biggestRiser,
  biggestFaller,
}: {
  open: boolean;
  onClose: () => void;
  weekNumber: number | null;
  allGamesCompleted: boolean;
  highestDollarTeam: { team: string; betCount: number; betAmount: number };
  mostBetTeam: { team: string; betCount: number; betAmount: number };
  contrarianTeam: { team: string; betCount: number; betAmount: number } | null;
  biggestSingleBet: { user: User; game: Game; wager: Wager } | null;
  biggestWinner: UserSummary | null;
  biggestLoser: UserSummary | null;
  perfectWeekUsers: UserSummary[];
  worstWeekUsers: UserSummary[];
  bestUpsetCall: { user: User; game: Game; wager: Wager; spreadMagnitude: number } | null;
  biggestRiser: RankChange | null;
  biggestFaller: RankChange | null;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-2xl">🏆 Week {weekNumber ?? ''} Recap</DialogTitle>

        <div className="space-y-6 mt-2">
          <div>
            <h3 className="font-bold text-lg mb-2">Before Kickoff</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <RecapStat label="Most Money On" value={highestDollarTeam.team || 'N/A'} detail={`♠${highestDollarTeam.betAmount.toLocaleString()} wagered`} />
              <RecapStat label="Most People On" value={mostBetTeam.team || 'N/A'} detail={`${mostBetTeam.betCount} bettors`} />
              {biggestSingleBet && (
                <RecapStat
                  label="Biggest Single Bet"
                  value={`♠${biggestSingleBet.wager.amount.toLocaleString()}`}
                  detail={`${displayName(biggestSingleBet.user)} on ${biggestSingleBet.wager.pick === 'home' ? biggestSingleBet.game.homeTeam.name : biggestSingleBet.game.awayTeam.name}`}
                />
              )}
              {contrarianTeam && (
                <RecapStat
                  label="Went Against the Crowd"
                  value={contrarianTeam.team}
                  detail={`Only ${contrarianTeam.betCount} bettor${contrarianTeam.betCount === 1 ? '' : 's'}`}
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">After the Dust Settled</h3>
            {!allGamesCompleted ? (
              <p className="text-sm text-gray-500">Check back once this week&apos;s games wrap up for winners, losers, and rank movement.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {biggestWinner && (
                  <RecapStat label="Biggest Winner" value={displayName(biggestWinner.user)} detail={`+♠${biggestWinner.balanceImpact.toLocaleString()}`} good />
                )}
                {biggestLoser && (
                  <RecapStat label="Biggest Loser" value={displayName(biggestLoser.user)} detail={`♠${biggestLoser.balanceImpact.toLocaleString()}`} bad />
                )}
                {perfectWeekUsers.length > 0 && (
                  <RecapStat label="Perfect Week" value={perfectWeekUsers.map(u => displayName(u.user)).join(', ')} detail={`${perfectWeekUsers[0].wins}-0`} good />
                )}
                {worstWeekUsers.length > 0 && (
                  <RecapStat label="Winless Week" value={worstWeekUsers.map(u => displayName(u.user)).join(', ')} detail={`0-${worstWeekUsers[0].losses}`} bad />
                )}
                {bestUpsetCall && (
                  <RecapStat
                    label="Best Upset Call"
                    value={displayName(bestUpsetCall.user)}
                    detail={`Took the ${bestUpsetCall.spreadMagnitude}-pt dog and covered`}
                    good
                  />
                )}
                {biggestRiser && biggestRiser.delta > 0 && (
                  <RecapStat label="Biggest Riser" value={displayName(biggestRiser.user)} detail={`Up ${biggestRiser.delta} spot${biggestRiser.delta === 1 ? '' : 's'} to #${biggestRiser.currentRank}`} good />
                )}
                {biggestFaller && biggestFaller.delta < 0 && (
                  <RecapStat label="Biggest Faller" value={displayName(biggestFaller.user)} detail={`Down ${Math.abs(biggestFaller.delta)} spot${Math.abs(biggestFaller.delta) === 1 ? '' : 's'} to #${biggestFaller.currentRank}`} bad />
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecapStat({ label, value, detail, good, bad }: { label: string; value: string; detail?: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-3">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`font-bold ${good ? 'text-green-600' : bad ? 'text-red-600' : ''}`}>{value}</div>
        {detail && <div className="text-xs text-gray-500">{detail}</div>}
      </div>
    </div>
  );
} 