import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get active season
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true }
    });

    if (!activeSeason) {
      return NextResponse.json([]);
    }

    // Get active week
    const activeWeek = await prisma.week.findFirst({
      where: {
        seasonId: activeSeason.id,
        active: true
      },
      select: { id: true, wagersAllowed: true }
    });

    if (!activeWeek) {
      return NextResponse.json([]);
    }

    // Get games for active week
    const games = await prisma.game.findMany({
      where: {
        weekId: activeWeek.id,
        active: true
      },
      orderBy: {
        startDate: 'asc'
      },
      select: {
        id: true,
        weekId: true,
        seasonId: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            rank: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            rank: true
          }
        },
        spread: true,
        startDate: true,
        venue: true,
        startingSpread: true,
        active: true,
        neutralSite: true
      }
    });

    // Add seasonId to each game object
    const gamesWithSeason = games.map(g => ({ ...g, seasonId: activeSeason.id }));
    // Return both games and wagersAllowed
    return NextResponse.json({ games: gamesWithSeason, wagersAllowed: activeWeek.wagersAllowed });
  } catch (error) {
    console.error('Error fetching active games:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 