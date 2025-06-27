import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('weekId');

    // Build where clause
    const whereClause: {
      completed: boolean;
      active?: boolean;
      weekId?: number;
    } = {
      completed: false,
    };

    // If weekId is provided, filter by week and don't filter by active
    if (weekId) {
      whereClause.weekId = parseInt(weekId);
    } else {
      // Only filter by active if no weekId is provided (for the main admin games page)
      whereClause.active = true;
    }

    const games = await prisma.game.findMany({
      where: whereClause,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            rank: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            rank: true,
          },
        },
        season: {
          select: {
            id: true,
            name: true,
          },
        },
        week: {
          select: {
            id: true,
            week: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Error fetching games' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const {
      providerGameId,
      seasonId,
      weekId,
      startDate,
      completed,
      neutralSite,
      homeId,
      homePoints,
      spread,
      startingSpread,
      awayId,
      awayPoints,
      resultId,
      venue
    } = body;

    const game = await prisma.game.create({
      data: {
        providerGameId: providerGameId ? Number(providerGameId) : null,
        seasonId,
        weekId,
        startDate: new Date(startDate),
        completed,
        neutralSite,
        homeId,
        homePoints,
        spread,
        startingSpread,
        awayId,
        awayPoints,
        resultId,
        venue
      }
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 