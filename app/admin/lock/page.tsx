'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/use-toast';

interface League {
  id: number;
  name: string;
}

interface LockInfo {
  exists: boolean;
  displayName?: string;
  balance?: number;
}

interface Game {
  id: number;
  homeTeam: { id: number; name: string; rank: number | null };
  awayTeam: { id: number; name: string; rank: number | null };
  spread: number | null;
  startDate: string;
}

interface CurrentPick {
  gameId: number;
  pick: 'home' | 'visit';
  amount: number;
}

export default function LockOfTheWeekAdmin() {
  const router = useRouter();
  const { toast } = useToast();

  const [hasAccess, setHasAccess] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savingSetup, setSavingSetup] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [wagersAllowed, setWagersAllowed] = useState(true);
  const [currentPick, setCurrentPick] = useState<CurrentPick | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedPick, setSelectedPick] = useState<'home' | 'visit' | ''>('');
  const [savingPick, setSavingPick] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchLeagues = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        const admin = !!userData?.admin;
        const isCommissioner = Array.isArray(userData?.commissionerLeagueIds) && userData.commissionerLeagueIds.length > 0;

        if (!admin && !isCommissioner) {
          router.push('/');
          return;
        }

        setHasAccess(true);

        const leaguesRes = await fetch('/api/admin/leagues');
        if (leaguesRes.ok) {
          const leaguesData: League[] = await leaguesRes.json();
          setLeagues(leaguesData);
          if (leaguesData.length > 0) setSelectedLeagueId(leaguesData[0].id);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/');
      }
    };
    checkAccessAndFetchLeagues();
  }, [router]);

  const fetchLockInfo = useCallback(async () => {
    if (!selectedLeagueId) return;
    try {
      const res = await fetch(`/api/admin/leagues/${selectedLeagueId}/lock`);
      if (!res.ok) throw new Error('Failed to fetch lock info');
      const data: LockInfo = await res.json();
      setLockInfo(data);
      setDisplayNameInput(data.displayName || '');
    } catch (error) {
      console.error('Error fetching lock info:', error);
      setLockInfo(null);
    }
  }, [selectedLeagueId]);

  const fetchGamesAndPick = useCallback(async () => {
    if (!selectedLeagueId) return;
    try {
      const [gamesRes, pickRes] = await Promise.all([
        fetch('/api/games/active'),
        fetch(`/api/admin/leagues/${selectedLeagueId}/lock/pick`),
      ]);
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGames(Array.isArray(gamesData) ? gamesData : gamesData.games);
        setWagersAllowed(Array.isArray(gamesData) ? true : gamesData.wagersAllowed);
      }
      if (pickRes.ok) {
        const pickData = await pickRes.json();
        setCurrentPick(pickData.pick);
        if (pickData.pick) {
          setSelectedGameId(pickData.pick.gameId);
          setSelectedPick(pickData.pick.pick);
        } else {
          setSelectedGameId(null);
          setSelectedPick('');
        }
      }
    } catch (error) {
      console.error('Error fetching games/pick:', error);
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    fetchLockInfo();
    fetchGamesAndPick();
  }, [fetchLockInfo, fetchGamesAndPick]);

  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeagueId || !displayNameInput.trim()) return;
    setSavingSetup(true);
    try {
      const res = await fetch(`/api/admin/leagues/${selectedLeagueId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayNameInput.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Lock entrant saved.' });
      await fetchLockInfo();
    } catch (error) {
      console.error('Error saving lock setup:', error);
      toast({ title: 'Error saving lock entrant', variant: 'destructive' });
    } finally {
      setSavingSetup(false);
    }
  };

  const handleSavePick = async () => {
    if (!selectedLeagueId || !selectedGameId || !selectedPick) return;
    setSavingPick(true);
    try {
      const res = await fetch(`/api/admin/leagues/${selectedLeagueId}/lock/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: selectedGameId, pick: selectedPick }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Lock of the week saved.' });
      await Promise.all([fetchGamesAndPick(), fetchLockInfo()]);
    } catch (error) {
      console.error('Error saving lock pick:', error);
      toast({ title: error instanceof Error ? error.message : 'Error saving pick', variant: 'destructive' });
    } finally {
      setSavingPick(false);
    }
  };

  const handleClearPick = async () => {
    if (!selectedLeagueId) return;
    setSavingPick(true);
    try {
      const res = await fetch(`/api/admin/leagues/${selectedLeagueId}/lock/pick`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Lock pick cleared.' });
      setSelectedGameId(null);
      setSelectedPick('');
      await Promise.all([fetchGamesAndPick(), fetchLockInfo()]);
    } catch (error) {
      console.error('Error clearing lock pick:', error);
      toast({ title: 'Error clearing pick', variant: 'destructive' });
    } finally {
      setSavingPick(false);
    }
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lock of the Week</h1>

      <div>
        <label className="sr-only" htmlFor="league-select">Select League</label>
        <select
          id="league-select"
          className="select select-bordered select-sm min-w-[200px]"
          value={selectedLeagueId ?? ''}
          onChange={(e) => setSelectedLeagueId(Number(e.target.value))}
          disabled={leagues.length === 0}
        >
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>

      {selectedLeagueId && lockInfo && !lockInfo.exists && (
        <form onSubmit={handleSaveSetup} className="space-y-3 max-w-md bg-base-200 p-4 rounded">
          <p className="text-sm">
            This league doesn&apos;t have a Lock entrant yet. Name it and it will show up in standings and the wagers table just like a player.
          </p>
          <div>
            <label className="block mb-1 text-sm">Lock display name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. The Lock"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingSetup || !displayNameInput.trim()}>
            {savingSetup ? 'Saving...' : 'Create Lock Entrant'}
          </button>
        </form>
      )}

      {selectedLeagueId && lockInfo?.exists && (
        <>
          <div className="flex items-center gap-4 bg-base-200 rounded px-4 py-2 text-sm">
            <span><span className="font-semibold">Name:</span> {lockInfo.displayName}</span>
            <span><span className="font-semibold">Balance:</span> ${lockInfo.balance}</span>
          </div>

          <form onSubmit={handleSaveSetup} className="flex items-end gap-2 max-w-md">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Rename</label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline btn-sm" disabled={savingSetup || !displayNameInput.trim()}>
              Save Name
            </button>
          </form>

          <div>
            <h2 className="text-xl font-semibold mb-2">This Week&apos;s Pick</h2>
            {!wagersAllowed && (
              <div className="mb-3 p-3 bg-error text-white text-center rounded font-bold">Wagers Locked</div>
            )}
            {currentPick && (
              <div className="mb-3 text-sm bg-base-200 rounded px-4 py-2">
                Currently locked in for <span className="font-semibold">${currentPick.amount}</span> on this week&apos;s pick.
              </div>
            )}
            {games.length === 0 && <p className="text-sm text-gray-400">No active games this week.</p>}
            <div className="space-y-2">
              {games.map((game) => {
                const isSelected = selectedGameId === game.id;
                return (
                  <div
                    key={game.id}
                    className={`border rounded p-3 ${isSelected ? 'border-primary' : 'border-gray-700'}`}
                  >
                    <div className="text-sm text-gray-400 mb-2">{new Date(game.startDate).toLocaleString()}</div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={!wagersAllowed}
                        className={`btn btn-sm flex-1 ${isSelected && selectedPick === 'visit' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setSelectedGameId(game.id); setSelectedPick('visit'); }}
                      >
                        {game.awayTeam.rank && <span className="font-bold">#{game.awayTeam.rank}</span>} {game.awayTeam.name}
                      </button>
                      <span className="self-center text-xs text-gray-500">@</span>
                      <button
                        type="button"
                        disabled={!wagersAllowed}
                        className={`btn btn-sm flex-1 ${isSelected && selectedPick === 'home' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setSelectedGameId(game.id); setSelectedPick('home'); }}
                      >
                        {game.homeTeam.rank && <span className="font-bold">#{game.homeTeam.rank}</span>} {game.homeTeam.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!wagersAllowed || savingPick || !selectedGameId || !selectedPick}
                onClick={handleSavePick}
              >
                {savingPick ? 'Saving...' : 'Save Pick'}
              </button>
              {currentPick && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={!wagersAllowed || savingPick}
                  onClick={handleClearPick}
                >
                  Clear Pick
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
