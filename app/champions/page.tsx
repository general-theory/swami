'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface League {
  id: number;
  name: string;
}

interface ChampionEntry {
  id: number;
  year: number;
  photoUrl: string;
  displayName: string;
  isCurrent: boolean;
}

export default function ChampionsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [champions, setChampions] = useState<ChampionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      try {
        const res = await fetch('/api/leagues');
        if (!res.ok) throw new Error('Failed to fetch leagues');
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
    if (!selectedLeagueId) return;
    const fetchChampions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/champions?leagueId=${selectedLeagueId}`);
        if (!res.ok) throw new Error('Failed to fetch champions');
        const data = await res.json();
        setChampions(data);
      } catch (e) {
        console.error('Error fetching champions:', e);
        setChampions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, [selectedLeagueId]);

  if (!isLoaded) return null;
  if (!isSignedIn) {
    redirect("/");
  }

  const current = champions.find(c => c.isCurrent) ?? null;
  const pastChampions = champions.filter(c => !c.isCurrent);

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <h1 className="text-4xl font-bold whitespace-nowrap">Champions</h1>
        <div className="flex-1" />
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : champions.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No champions crowned yet for this league.</p>
      ) : (
        <div className="space-y-12">
          {current && (
            <div className="flex flex-col items-center text-center">
              <div className="badge badge-warning gap-1 mb-4 text-sm font-semibold px-3 py-3">
                🏆 Current Champion
              </div>
              <div className="h-56 w-56 sm:h-72 sm:w-72 rounded-full overflow-hidden shadow-2xl ring-4 ring-yellow-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.photoUrl}
                  alt={current.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold mt-4">{current.displayName}</h2>
              <p className="text-lg text-gray-500">{current.year} Champion</p>
            </div>
          )}

          {pastChampions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-center">Hall of Champions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {pastChampions.map(c => (
                  <div key={c.id} className="flex flex-col items-center text-center">
                    <div className="h-28 w-28 rounded-full overflow-hidden shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.photoUrl} alt={c.displayName} className="h-full w-full object-cover" />
                    </div>
                    <div className="font-semibold mt-2">{c.displayName}</div>
                    <div className="text-sm text-gray-500">{c.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
