import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

interface GameForResult {
  completed: boolean;
  homePoints: number | null;
  awayPoints: number | null;
  spread: number | null;
}

interface WagerForResult {
  pick: string;
  amount: number;
}

function getWagerResult(wager: WagerForResult, game: GameForResult): 'win' | 'loss' | null {
  if (!game.completed || game.homePoints === null || game.awayPoints === null) {
    return null;
  }
  const spread = game.spread || 0;
  const adjustedHomeScore = game.homePoints + spread;
  const homeWon = adjustedHomeScore > game.awayPoints;
  const userPickedHome = wager.pick === 'home';
  const userWon = (userPickedHome && homeWon) || (!userPickedHome && !homeWon);
  return userWon ? 'win' : 'loss';
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = Number(searchParams.get('leagueId'));
    const scope = searchParams.get('scope'); // 'current' | 'season' | 'all'
    const seasonIdParam = searchParams.get('seasonId');

    if (!leagueId || !scope) {
      return NextResponse.json({ error: 'leagueId and scope are required' }, { status: 400 });
    }

    if (scope === 'all') {
      const participations = await prisma.userParticipation.findMany({
        where: { userId: currentUser.id, leagueId, active: true },
        include: { season: { select: { id: true, year: true } } },
        orderBy: { season: { year: 'asc' } },
      });

      const allWagers = await prisma.wager.findMany({
        where: { userId: currentUser.id, leagueId },
        select: {
          amount: true,
          pick: true,
          game: {
            select: { seasonId: true, completed: true, homePoints: true, awayPoints: true, spread: true },
          },
        },
      });

      const seasons = participations.map((p) => {
        const seasonWagers = allWagers.filter((w) => w.game.seasonId === p.seasonId);
        let wins = 0;
        let losses = 0;
        let totalWagered = 0;
        seasonWagers.forEach((w) => {
          totalWagered += w.amount;
          const result = getWagerResult(w, w.game);
          if (result === 'win') wins++;
          else if (result === 'loss') losses++;
        });
        return {
          seasonId: p.seasonId,
          year: p.season.year,
          finalBalance: p.balance,
          wins,
          losses,
          totalWagered,
        };
      });

      const careerWins = seasons.reduce((sum, s) => sum + s.wins, 0);
      const careerLosses = seasons.reduce((sum, s) => sum + s.losses, 0);

      const currentSeason = await prisma.season.findFirst({ where: { active: true }, select: { id: true } });

      return NextResponse.json({
        mode: 'all',
        seasonsPlayed: seasons.length,
        careerRecord: { wins: careerWins, losses: careerLosses },
        seasons,
        currentSeasonId: currentSeason?.id ?? null,
      });
    }

    // scope === 'current' | 'season'
    const season = scope === 'current'
      ? await prisma.season.findFirst({ where: { active: true }, select: { id: true, year: true } })
      : await prisma.season.findUnique({ where: { id: Number(seasonIdParam) }, select: { id: true, year: true } });

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    const participation = await prisma.userParticipation.findFirst({
      where: { userId: currentUser.id, leagueId, seasonId: season.id, active: true },
      select: { balance: true },
    });

    if (!participation) {
      return NextResponse.json({ error: 'Not participating in this league/season' }, { status: 404 });
    }

    const weeks = await prisma.week.findMany({
      where: { seasonId: season.id, wagersAllowed: false },
      orderBy: { week: 'asc' },
      select: { id: true, week: true },
    });
    const weekNumberByWeekId = new Map(weeks.map((w) => [w.id, w.week]));

    const wagers = await prisma.wager.findMany({
      where: { userId: currentUser.id, leagueId, game: { seasonId: season.id } },
      select: {
        amount: true,
        pick: true,
        balanceImpact: true,
        game: { select: { weekId: true, completed: true, homePoints: true, awayPoints: true, spread: true } },
      },
    });

    let wins = 0;
    let losses = 0;
    let totalWagered = 0;
    const impactByWeekNumber = new Map<number, number>();
    wagers.forEach((w) => {
      totalWagered += w.amount;
      const result = getWagerResult(w, w.game);
      if (result === 'win') wins++;
      else if (result === 'loss') losses++;

      const weekNumber = weekNumberByWeekId.get(w.game.weekId);
      if (weekNumber !== undefined) {
        impactByWeekNumber.set(weekNumber, (impactByWeekNumber.get(weekNumber) ?? 0) + w.balanceImpact);
      }
    });

    let cumulative = 1000;
    const weeklyBalances = weeks.map((w) => {
      cumulative += impactByWeekNumber.get(w.week) ?? 0;
      return { week: w.week, balance: cumulative };
    });

    return NextResponse.json({
      mode: 'season',
      season,
      record: { wins, losses },
      totalWagered,
      currentBalance: participation.balance,
      weeklyBalances,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
