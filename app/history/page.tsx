'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface League {
  id: number;
  name: string;
}

interface SeasonSummary {
  seasonId: number;
  year: number;
  finalBalance: number;
  wins: number;
  losses: number;
  totalWagered: number;
}

interface AllTimeData {
  mode: 'all';
  seasonsPlayed: number;
  careerRecord: { wins: number; losses: number };
  seasons: SeasonSummary[];
  currentSeasonId: number | null;
}

interface WeeklyBalance {
  week: number;
  balance: number;
}

interface SeasonData {
  mode: 'season';
  season: { id: number; year: number };
  record: { wins: number; losses: number };
  totalWagered: number;
  currentBalance: number;
  weeklyBalances: WeeklyBalance[];
}

type Scope = 'current' | 'all' | number;

function winPct(wins: number, losses: number): string {
  const total = wins + losses;
  return total === 0 ? '—' : `${Math.round((wins / total) * 100)}%`;
}

function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `-$${Math.abs(rounded).toLocaleString()}` : `$${rounded.toLocaleString()}`;
}

const VIZ_STYLE = `
.viz-root {
  --surface: #fcfcfb;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --text-muted: #898781;
  --grid: #e1e0d9;
  --baseline: #c3c2b7;
  --series: #2a78d6;
  --diverge-pos: #2a78d6;
  --diverge-neg: #e34948;
}
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) .viz-root {
    --surface: #1a1a19;
    --text-primary: #ffffff;
    --text-secondary: #c3c2b7;
    --text-muted: #898781;
    --grid: #2c2c2a;
    --baseline: #383835;
    --series: #3987e5;
    --diverge-pos: #3987e5;
    --diverge-neg: #e66767;
  }
}
:root[data-theme="dark"] .viz-root {
  --surface: #1a1a19;
  --text-primary: #ffffff;
  --text-secondary: #c3c2b7;
  --text-muted: #898781;
  --grid: #2c2c2a;
  --baseline: #383835;
  --series: #3987e5;
  --diverge-pos: #3987e5;
  --diverge-neg: #e66767;
}
`;

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  const [allTimeData, setAllTimeData] = useState<AllTimeData | null>(null);
  const [scope, setScope] = useState<Scope>('current');
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      try {
        const res = await fetch('/api/leagues/active');
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

  const fetchAllTime = useCallback(async () => {
    if (!selectedLeagueId) return;
    try {
      const res = await fetch(`/api/history?leagueId=${selectedLeagueId}&scope=all`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setAllTimeData(data);
    } catch (e) {
      console.error('Error fetching all-time history:', e);
      setAllTimeData(null);
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    setScope('current');
    fetchAllTime();
  }, [selectedLeagueId, fetchAllTime]);

  useEffect(() => {
    if (!selectedLeagueId || scope === 'all') return;
    const fetchSeason = async () => {
      setLoading(true);
      try {
        const params = scope === 'current'
          ? `scope=current`
          : `scope=season&seasonId=${scope}`;
        const res = await fetch(`/api/history?leagueId=${selectedLeagueId}&${params}`);
        if (!res.ok) throw new Error('Failed to fetch season history');
        const data = await res.json();
        setSeasonData(data);
      } catch (e) {
        console.error('Error fetching season history:', e);
        setSeasonData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSeason();
  }, [selectedLeagueId, scope]);

  if (!isLoaded) return null;
  if (!isSignedIn) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <style>{VIZ_STYLE}</style>
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold whitespace-nowrap">My History</h1>
        <div className="flex-1" />
        <div>
          <label className="block text-sm font-medium mb-1">League</label>
          <select
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
        <div>
          <label className="block text-sm font-medium mb-1">Season</label>
          <select
            className="select select-primary select-sm min-w-[160px]"
            value={scope.toString()}
            onChange={e => {
              const v = e.target.value;
              setScope(v === 'current' || v === 'all' ? v : Number(v));
            }}
            disabled={!allTimeData}
          >
            <option value="current">Current Season</option>
            {allTimeData?.seasons
              .filter(s => s.seasonId !== allTimeData.currentSeasonId)
              .sort((a, b) => b.year - a.year)
              .map(s => (
                <option key={s.seasonId} value={s.seasonId}>{s.year}</option>
              ))}
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {!selectedLeagueId ? (
        <p className="text-center text-gray-500 py-12">Join a league to see your history.</p>
      ) : scope === 'all' ? (
        allTimeData ? <AllTimeView data={allTimeData} /> : <LoadingBlock />
      ) : loading || !seasonData ? (
        <LoadingBlock />
      ) : (
        <SeasonView data={seasonData} />
      )}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat bg-base-200 rounded-lg">
      <div className="stat-title">{label}</div>
      <div className="stat-value text-2xl">{value}</div>
      {sub && <div className="stat-desc">{sub}</div>}
    </div>
  );
}

function SeasonView({ data }: { data: SeasonData }) {
  return (
    <div className="space-y-6">
      <div className="stats shadow w-full grid grid-cols-2 sm:grid-cols-4">
        <StatTile label="Current Balance" value={`$${data.currentBalance.toLocaleString()}`} />
        <StatTile label="Record" value={`${data.record.wins}-${data.record.losses}`} sub={winPct(data.record.wins, data.record.losses)} />
        <StatTile label="Total Wagered" value={`$${data.totalWagered.toLocaleString()}`} />
        <StatTile label="Season" value={data.season.year.toString()} />
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-2">Balance by Week</h2>
          <BalanceLineChart weeklyBalances={data.weeklyBalances} />
        </div>
      </div>
    </div>
  );
}

function AllTimeView({ data }: { data: AllTimeData }) {
  return (
    <div className="space-y-6">
      <div className="stats shadow w-full grid grid-cols-1 sm:grid-cols-3">
        <StatTile label="Seasons Played" value={data.seasonsPlayed.toString()} />
        <StatTile
          label="Career Record"
          value={`${data.careerRecord.wins}-${data.careerRecord.losses}`}
          sub={winPct(data.careerRecord.wins, data.careerRecord.losses)}
        />
        <StatTile label="Career Win %" value={winPct(data.careerRecord.wins, data.careerRecord.losses)} />
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-2">Final Balance by Season</h2>
          <SeasonBalanceBarChart seasons={data.seasons} />
        </div>
      </div>
    </div>
  );
}

function BalanceLineChart({ weeklyBalances }: { weeklyBalances: WeeklyBalance[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  if (weeklyBalances.length === 0) {
    return <p className="text-sm text-gray-500">No completed weeks yet this season.</p>;
  }

  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 16, bottom: 32, left: 64 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const balances = weeklyBalances.map(w => w.balance);
  const minBalance = Math.min(1000, ...balances);
  const maxBalance = Math.max(1000, ...balances);
  const range = Math.max(maxBalance - minBalance, 100);
  const yPad = range * 0.15;
  const yMin = minBalance - yPad;
  const yMax = maxBalance + yPad;

  const n = weeklyBalances.length;
  const xForIndex = (i: number) => padding.left + (n === 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth);
  const yForBalance = (b: number) => padding.top + plotHeight - ((b - yMin) / (yMax - yMin)) * plotHeight;

  const linePoints = weeklyBalances.map((w, i) => `${xForIndex(i)},${yForBalance(w.balance)}`).join(' ');
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => yMin + (i / gridSteps) * (yMax - yMin));
  const baselineY = yForBalance(1000);
  const finalBalance = weeklyBalances[n - 1].balance;
  const hitWidth = n > 1 ? plotWidth / (n - 1) : plotWidth;

  return (
    <div className="viz-root">
      <div className="flex items-center justify-end mb-1">
        <button className="text-xs underline text-gray-500" onClick={() => setShowTable(s => !s)}>
          {showTable ? 'View chart' : 'View as table'}
        </button>
      </div>

      {showTable ? (
        <table className="table table-sm w-full">
          <thead><tr><th>Week</th><th className="text-right">Balance</th></tr></thead>
          <tbody>
            {weeklyBalances.map(w => (
              <tr key={w.week}><td>{w.week}</td><td className="text-right">${w.balance.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            role="img"
            aria-label="Balance by week line chart"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {gridValues.map((v, i) => (
              <g key={i}>
                <line x1={padding.left} x2={width - padding.right} y1={yForBalance(v)} y2={yForBalance(v)} stroke="var(--grid)" strokeWidth={1} />
                <text x={padding.left - 8} y={yForBalance(v)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-muted)">
                  {formatCurrency(v)}
                </text>
              </g>
            ))}

            <line x1={padding.left} x2={width - padding.right} y1={baselineY} y2={baselineY} stroke="var(--baseline)" strokeWidth={1} />

            {hoverIndex !== null && (
              <line x1={xForIndex(hoverIndex)} x2={xForIndex(hoverIndex)} y1={padding.top} y2={padding.top + plotHeight} stroke="var(--text-muted)" strokeWidth={1} />
            )}

            <polyline points={linePoints} fill="none" stroke="var(--series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            <circle cx={xForIndex(n - 1)} cy={yForBalance(finalBalance)} r={4} fill="var(--series)" stroke="var(--surface)" strokeWidth={2} />
            {hoverIndex !== null && (
              <circle cx={xForIndex(hoverIndex)} cy={yForBalance(weeklyBalances[hoverIndex].balance)} r={4} fill="var(--series)" stroke="var(--surface)" strokeWidth={2} />
            )}

            <text x={width - padding.right} y={Math.max(yForBalance(finalBalance) - 10, padding.top + 10)} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--text-primary)">
              {formatCurrency(finalBalance)}
            </text>

            {weeklyBalances.map((w, i) => (
              <text key={w.week} x={xForIndex(i)} y={height - padding.bottom + 18} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
                {w.week}
              </text>
            ))}

            {weeklyBalances.map((w, i) => (
              <rect
                key={w.week}
                x={xForIndex(i) - hitWidth / 2}
                y={padding.top}
                width={hitWidth}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                onMouseEnter={() => setHoverIndex(i)}
                onFocus={() => setHoverIndex(i)}
              />
            ))}
          </svg>

          {hoverIndex !== null && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-base-100 border border-base-300 rounded shadow px-2 py-1 text-xs whitespace-nowrap"
              style={{
                left: `${(xForIndex(hoverIndex) / width) * 100}%`,
                top: `${(yForBalance(weeklyBalances[hoverIndex].balance) / height) * 100}%`,
              }}
            >
              <div className="font-semibold">${weeklyBalances[hoverIndex].balance.toLocaleString()}</div>
              <div className="text-gray-500">Week {weeklyBalances[hoverIndex].week}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeasonBalanceBarChart({ seasons }: { seasons: SeasonSummary[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  if (seasons.length === 0) {
    return <p className="text-sm text-gray-500">No seasons played yet.</p>;
  }

  const width = 640;
  const height = 260;
  const padding = { top: 24, right: 16, bottom: 32, left: 64 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const balances = seasons.map(s => s.finalBalance);
  const maxAbove = Math.max(0, ...balances.map(b => b - 1000));
  const maxBelow = Math.max(0, ...balances.map(b => 1000 - b));
  const span = Math.max(maxAbove, maxBelow, 100) * 1.2;
  const yMin = 1000 - span;
  const yMax = 1000 + span;

  const yForBalance = (b: number) => padding.top + plotHeight - ((b - yMin) / (yMax - yMin)) * plotHeight;
  const baselineY = yForBalance(1000);

  const n = seasons.length;
  const bandWidth = plotWidth / n;
  const barWidth = Math.min(24, bandWidth * 0.5);
  const xForIndex = (i: number) => padding.left + bandWidth * i + bandWidth / 2;

  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => yMin + (i / gridSteps) * (yMax - yMin));

  return (
    <div className="viz-root">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--diverge-pos)' }} /> Above $1,000</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--diverge-neg)' }} /> Below $1,000</span>
        </div>
        <button className="text-xs underline text-gray-500" onClick={() => setShowTable(s => !s)}>
          {showTable ? 'View chart' : 'View as table'}
        </button>
      </div>

      {showTable ? (
        <table className="table table-sm w-full">
          <thead><tr><th>Season</th><th className="text-right">Final Balance</th><th className="text-right">Record</th></tr></thead>
          <tbody>
            {seasons.map(s => (
              <tr key={s.seasonId}>
                <td>{s.year}</td>
                <td className="text-right">${s.finalBalance.toLocaleString()}</td>
                <td className="text-right">{s.wins}-{s.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Final balance by season bar chart" onMouseLeave={() => setHoverIndex(null)}>
            {gridValues.map((v, i) => (
              <g key={i}>
                <line x1={padding.left} x2={width - padding.right} y1={yForBalance(v)} y2={yForBalance(v)} stroke="var(--grid)" strokeWidth={1} />
                <text x={padding.left - 8} y={yForBalance(v)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-muted)">
                  {formatCurrency(v)}
                </text>
              </g>
            ))}

            <line x1={padding.left} x2={width - padding.right} y1={baselineY} y2={baselineY} stroke="var(--baseline)" strokeWidth={1} />

            {seasons.map((s, i) => {
              const isGain = s.finalBalance >= 1000;
              const barY = isGain ? yForBalance(s.finalBalance) : baselineY;
              const barHeight = Math.abs(yForBalance(s.finalBalance) - baselineY);
              const cx = xForIndex(i);
              return (
                <g key={s.seasonId}>
                  <rect
                    x={cx - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={Math.max(barHeight, 1)}
                    rx={4}
                    fill={isGain ? 'var(--diverge-pos)' : 'var(--diverge-neg)'}
                  />
                  <text
                    x={cx}
                    y={isGain ? barY - 6 : barY + barHeight + 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--text-primary)"
                  >
                    {formatCurrency(s.finalBalance)}
                  </text>
                  <text x={cx} y={height - padding.bottom + 18} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
                    {s.year}
                  </text>
                  <rect
                    x={cx - bandWidth / 2}
                    y={padding.top}
                    width={bandWidth}
                    height={plotHeight}
                    fill="transparent"
                    tabIndex={0}
                    onMouseEnter={() => setHoverIndex(i)}
                    onFocus={() => setHoverIndex(i)}
                  />
                </g>
              );
            })}
          </svg>

          {hoverIndex !== null && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-base-100 border border-base-300 rounded shadow px-2 py-1 text-xs whitespace-nowrap"
              style={{
                left: `${(xForIndex(hoverIndex) / width) * 100}%`,
                top: `${(Math.min(yForBalance(seasons[hoverIndex].finalBalance), baselineY) / height) * 100}%`,
              }}
            >
              <div className="font-semibold">${seasons[hoverIndex].finalBalance.toLocaleString()}</div>
              <div className="text-gray-500">{seasons[hoverIndex].year} &middot; {seasons[hoverIndex].wins}-{seasons[hoverIndex].losses}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
