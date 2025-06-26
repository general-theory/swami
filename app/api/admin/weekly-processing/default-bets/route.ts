import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

interface PlayerWithBets {
  userId: string;
  userName: string;
  userEmail: string;
  leagueId: number;
  leagueName: string;
  balance: number;
  minBet: number;
  currentBetTotal: number;
  shortfall: number;
}

interface ParticipationWithUser {
  userId: number;
  leagueId: number;
  balance: number;
  user: {
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  league: {
    id: number;
    name: string;
  };
}

// Define calculateBetLimits function locally to avoid import issues
function calculateBetLimits(balance: number) {
  // Calculate minimum bet
  let minBet = 0;
  if (balance > 0) {
    // Calculate half of balance and round up to nearest 10
    minBet = Math.ceil((balance / 2) / 10) * 10;
  }

  // Calculate maximum bet (absolute value of balance + 1000)
  const maxBet = Math.abs(balance) + 1000;

  return { minBet, maxBet };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true },
    });

    if (!user?.admin) {
      return new NextResponse('Forbidden - Admin access required', { status: 403 });
    }

    // Get the active season and week
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });

    if (!activeSeason) {
      return NextResponse.json([]);
    }

    const activeWeek = await prisma.week.findFirst({
      where: {
        seasonId: activeSeason.id,
        active: true,
      },
      select: { id: true },
    });

    if (!activeWeek) {
      return NextResponse.json([]);
    }

    // Get all participations for the active season
    const participations = await prisma.userParticipation.findMany({
      where: {
        seasonId: activeSeason.id,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get all wagers for the active week
    const weekWagers = await prisma.wager.findMany({
      where: {
        game: {
          weekId: activeWeek.id,
        },
      },
      select: {
        userId: true,
        leagueId: true,
        amount: true,
      },
    });

    // Calculate bet totals by user and league
    const betTotals = new Map<string, number>();
    weekWagers.forEach(wager => {
      const key = `${wager.userId}-${wager.leagueId}`;
      betTotals.set(key, (betTotals.get(key) || 0) + wager.amount);
    });

    // Process participations and check minimum bet requirements
    const playersWithShortfall: PlayerWithBets[] = [];

    participations.forEach((participation: ParticipationWithUser) => {
      const key = `${participation.userId}-${participation.leagueId}`;
      const currentBetTotal = betTotals.get(key) || 0;
      const { minBet } = calculateBetLimits(participation.balance);

      if (currentBetTotal < minBet) {
        playersWithShortfall.push({
          userId: participation.user.clerkId,
          userName: `${participation.user.firstName} ${participation.user.lastName}`,
          userEmail: participation.user.email,
          leagueId: participation.league.id,
          leagueName: participation.league.name,
          balance: participation.balance,
          minBet,
          currentBetTotal,
          shortfall: minBet - currentBetTotal,
        });
      }
    });

    // Sort by league name, then by shortfall (highest first)
    playersWithShortfall.sort((a, b) => {
      if (a.leagueName !== b.leagueName) {
        return a.leagueName.localeCompare(b.leagueName);
      }
      return b.shortfall - a.shortfall;
    });

    return NextResponse.json(playersWithShortfall);
  } catch (error) {
    console.error('Error fetching default bets data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 