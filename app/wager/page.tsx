'use client';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { calculateBetLimits } from "../lib/db/participation";
import { useToast } from "../components/ui/use-toast";

interface Game {
  id: number;
  weekId: number;
  seasonId: number;
  homeTeam: {
    id: number;
    name: string;
    logo: string | null;
    rank: number | null;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string | null;
    rank: number | null;
  };
  spread: number | null;
  startDate: string;
  venue: string | null;
  startingSpread: number | null;
  neutralSite: boolean;
}

interface League {
  id: number;
  name: string;
}

interface Wager {
  gameId: number;
  pick: 'home' | 'visit';
  amount: number;
}

interface Participation {
  balance: number;
}

function WagerModal({ open, onClose, game, leagueId, onWagerSuccess, existingWager, participation, currentBetTotal }: {
  open: boolean;
  onClose: () => void;
  game: Game | null;
  leagueId: number | null;
  onWagerSuccess: () => void;
  existingWager?: Wager | null;
  participation: Participation | null;
  currentBetTotal: number;
}) {
  const [pick, setPick] = useState<'home' | 'visit' | ''>('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingWager) {
      setPick(existingWager.pick);
      setAmount(existingWager.amount.toString());
    } else {
      setPick('');
      setAmount('');
    }
  }, [existingWager, game]);

  if (!game) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!pick) return setError('Pick a winner.');
    if (isNaN(amt) || amt < 0) return setError('Amount must be >= 0.');
    if (amt % 10 !== 0) return setError('Amount must be in $10 increments.');
    if (!leagueId) return setError('No league selected.');
    
    // Check max bet limit
    if (participation) {
      const { maxBet } = calculateBetLimits(participation.balance);
      const existingAmount = existingWager ? existingWager.amount : 0;
      const newTotal = currentBetTotal - existingAmount + amt;
      if (newTotal > maxBet) {
        return setError(`This wager would exceed your maximum bet limit. Your current total is $${currentBetTotal}, and your max bet is $${maxBet}.`);
      }
    }
    
    setLoading(true);
    try {
      const method = existingWager ? 'PUT' : 'POST';
      const res = await fetch('/api/wagers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          leagueId,
          pick,
          amount: amt
        })
      });
      if (!res.ok) throw new Error(await res.text());
      onWagerSuccess();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || 'Error placing wager');
      } else {
        setError('Error placing wager');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg w-full">
        <DialogTitle className="text-lg sm:text-xl">Place Wager</DialogTitle>
        <div className="mb-4 space-y-1 text-sm sm:text-base">
          <div className="font-semibold">
            {game.awayTeam.rank && <span className="font-bold">#{game.awayTeam.rank}</span>} {game.awayTeam.name} 
            <span className="text-xs text-gray-400"> at </span>
            {game.homeTeam.rank && <span className="font-bold">#{game.homeTeam.rank}</span>} {game.homeTeam.name}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">{new Date(game.startDate).toLocaleString()}</div>
          <div className="text-xs sm:text-sm">Venue: {game.venue || 'N/A'}
            {game.neutralSite && (
              <span className="ml-2 inline-block bg-warning text-warning-content text-xs font-semibold px-2 py-0.5 rounded">Neutral Site</span>
            )}
          </div>
          <div className="text-xs sm:text-sm">Spread: {game.spread ?? 'N/A'} (Starting: {game.startingSpread ?? 'N/A'})</div>
          <div className="flex items-center text-xs sm:text-sm"><span className="font-semibold w-16 sm:w-20">Favored:</span> {typeof game.spread === 'number' ? (game.spread < 0 ? game.homeTeam.name : game.awayTeam.name) : 'N/A'}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button type="button" className={`btn flex-1 text-xs sm:text-sm py-2 sm:py-3 ${pick==='home'?'btn-primary':'btn-outline'}`} onClick={()=>setPick('home')}>
              {game.homeTeam.rank && <span className="font-bold">#{game.homeTeam.rank}</span>} {game.homeTeam.name}
            </button>
            <button type="button" className={`btn flex-1 text-xs sm:text-sm py-2 sm:py-3 ${pick==='visit'?'btn-primary':'btn-outline'}`} onClick={()=>setPick('visit')}>
              {game.awayTeam.rank && <span className="font-bold">#{game.awayTeam.rank}</span>} {game.awayTeam.name}
            </button>
          </div>
          <div>
            <label className="block mb-1 text-sm sm:text-base">Amount ($)</label>
            <input type="number" className="input input-bordered w-full text-sm sm:text-base" min={0} step={10} value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          {error && <div className="text-error text-xs sm:text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm sm:btn-md" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm sm:btn-md" disabled={loading}>Place Wager</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Wager() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [editingWager, setEditingWager] = useState<Wager | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [wagersAllowed, setWagersAllowed] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games/active');
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        if (Array.isArray(data)) {
          setGames(data);
          setWagersAllowed(true); // fallback for old API
        } else {
          setGames(data.games);
          setWagersAllowed(data.wagersAllowed);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchGames();
    }
  }, [isSignedIn]);

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

  const fetchWagers = useCallback(async () => {
    if (!selectedLeagueId || games.length === 0) {
      setWagers([]);
      return;
    }
    const weekId = games[0]?.weekId;
    if (!weekId) {
      setWagers([]);
      return;
    }
    try {
      const res = await fetch(`/api/wagers?weekId=${weekId}&leagueId=${selectedLeagueId}`);
      if (!res.ok) throw new Error('Failed to fetch wagers');
      const data = await res.json();
      setWagers(data);
    } catch (e) {
      console.error('Error fetching wagers:', e);
      setWagers([]);
    }
  }, [selectedLeagueId, games]);

  useEffect(() => {
    fetchWagers();
  }, [fetchWagers]);

  useEffect(() => {
    const fetchParticipation = async () => {
      if (!selectedLeagueId || games.length === 0) {
        setParticipation(null);
        return;
      }
      const seasonId = games[0]?.seasonId;
      if (!seasonId) {
        setParticipation(null);
        return;
      }
      try {
        const res = await fetch(`/api/participations?leagueId=${selectedLeagueId}&seasonId=${seasonId}`);
        if (!res.ok) {
          if (res.status === 404) {
            // User is not participating in this league/season
            setParticipation(null);
            return;
          }
          throw new Error('Failed to fetch participation');
        }
        const data = await res.json();
        setParticipation(data);
      } catch (e) {
        console.error('Error fetching participation:', e);
        setParticipation(null);
      }
    };
    fetchParticipation();
  }, [selectedLeagueId, games]);

  // Calculate bet limits using the same logic as standings page
  const { minBet, maxBet } = participation ? calculateBetLimits(participation.balance) : { minBet: 0, maxBet: 0 };
  
  // Calculate current bet total for the selected league and week
  const currentBetTotal = wagers.reduce((sum, w) => sum + w.amount, 0);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const handleGameClick = (game: Game) => {
    if (!wagersAllowed) return;
    const now = new Date();
    const gameStart = new Date(game.startDate);
    if (now >= gameStart) {
      toast({ title: "This game has already kicked off.", variant: "destructive" });
      return;
    }
    const wager = wagers.find(w => w.gameId === game.id) || null;
    setSelectedGame(game);
    setModalOpen(true);
    setEditingWager(wager);
  };

  const handleWagerSuccess = () => {
    fetchWagers();
    // Optionally show a toast
  };

  return (
    <div className="container mx-auto p-8">
      {!wagersAllowed && (
        <div className="mb-4 p-4 bg-error text-white text-center rounded font-bold text-lg">Wagers Locked</div>
      )}
      
      {!participation && selectedLeagueId && games.length > 0 && (
        <div className="mb-4 p-4 bg-warning text-warning-content text-center rounded font-bold text-lg">
          You are not participating in this league for the current season.
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-4xl font-bold whitespace-nowrap">Place Your Wagers</h1>
        <div className="flex-1 flex justify-center gap-2">
          <div className="bg-base-200 rounded px-3 py-1 text-sm">
            <span className="font-semibold">Balance:</span> ${participation?.balance || 0}
          </div>
          <div className="bg-base-200 rounded px-3 py-1 text-sm">
            <span className="font-semibold">Min Bet:</span> ${minBet}
          </div>
          <div className="bg-base-200 rounded px-3 py-1 text-sm">
            <span className="font-semibold">Max Bet:</span> ${maxBet}
          </div>
          <div className={`bg-base-200 rounded px-3 py-1 text-sm ${currentBetTotal < minBet || currentBetTotal > maxBet ? 'text-error' : ''}`}> 
            <span className="font-semibold">Current Bet Total:</span> ${currentBetTotal}
          </div>
        </div>
        <div>
          <label className="sr-only" htmlFor="league-select">Select League</label>
          <select
            id="league-select"
            className="select select-primary select-sm min-w-[160px]"
            value={selectedLeagueId ?? ''}
            onChange={e => setSelectedLeagueId(Number(e.target.value))}
            disabled={loadingLeagues || leagues.length === 0}
          >
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="px-4 py-2 text-left">Amount Wagered</th>
              <th className="px-4 py-2 text-left">Favored</th>
              <th className="px-4 py-2 text-left">Spread</th>
              <th className="px-4 py-2 text-left">Underdog</th>
              <th className="px-4 py-2 text-left">Amount Wagered</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const isHomeFavored = game.spread !== null && game.spread < 0;
              const favoredTeam = isHomeFavored ? 'home' : 'visit';
              const underdogTeam = isHomeFavored ? 'visit' : 'home';
              const spread = game.spread === null ? 'NL' : Math.abs(game.spread).toString();
              const wager = wagers.find(w => w.gameId === game.id);
              const favoredAmount = wager && wager.pick === favoredTeam ? wager.amount : 0;
              const underdogAmount = wager && wager.pick === underdogTeam ? wager.amount : 0;
              return (
                <tr 
                  key={game.id}
                  onClick={wagersAllowed ? () => handleGameClick(game) : undefined}
                  className={`border-b border-gray-700 ${wagersAllowed ? 'hover:bg-gray-800 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <td className="px-4 py-2">{favoredAmount}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isHomeFavored ? (
                        <>
                          <span>@</span>
                          {game.homeTeam.rank && <span className="font-bold">#{game.homeTeam.rank}</span>}
                          <span>{game.homeTeam.name}</span>
                          {game.homeTeam.logo && (
                            <Image
                              src={game.homeTeam.logo}
                              alt={`${game.homeTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          {game.awayTeam.rank && <span className="font-bold">#{game.awayTeam.rank}</span>}
                          <span>{game.awayTeam.name}</span>
                          {game.awayTeam.logo && (
                            <Image
                              src={game.awayTeam.logo}
                              alt={`${game.awayTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">{spread}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isHomeFavored ? (
                        <>
                          {game.awayTeam.rank && <span className="font-bold">#{game.awayTeam.rank}</span>}
                          <span>{game.awayTeam.name}</span>
                          {game.awayTeam.logo && (
                            <Image
                              src={game.awayTeam.logo}
                              alt={`${game.awayTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <span>@</span>
                          {game.homeTeam.rank && <span className="font-bold">#{game.homeTeam.rank}</span>}
                          <span>{game.homeTeam.name}</span>
                          {game.homeTeam.logo && (
                            <Image
                              src={game.homeTeam.logo}
                              alt={`${game.homeTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">{underdogAmount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <WagerModal
        open={modalOpen}
        onClose={()=>{ setModalOpen(false); setEditingWager(null); }}
        game={selectedGame}
        leagueId={selectedLeagueId}
        onWagerSuccess={handleWagerSuccess}
        existingWager={editingWager}
        participation={participation}
        currentBetTotal={currentBetTotal}
      />
    </div>
  );
} 