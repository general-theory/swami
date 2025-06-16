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
      select: { id: true }
    });

    if (!activeWeek) {
      return NextResponse.json([]);
    }

    // Get games for active week
    const games = await prisma.game.findMany({
      where: {
        weekId: activeWeek.id,
        completed: false
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching active games:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 