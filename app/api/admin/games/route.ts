import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
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

    const games = await prisma.game.findMany({
      include: {
        season: {
          select: {
            name: true
          }
        },
        week: {
          select: {
            week: true
          }
        },
        homeTeam: {
          select: {
            name: true
          }
        },
        awayTeam: {
          select: {
            name: true
          }
        },
        resultTeam: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    const formattedGames = games.map(game => ({
      id: game.id,
      seasonId: game.seasonId,
      seasonName: game.season.name,
      weekId: game.weekId,
      weekNumber: game.week.week,
      startDate: game.startDate.toISOString(),
      completed: game.completed,
      neutralSite: game.neutralSite,
      homeId: game.homeId,
      homeTeam: game.homeTeam.name,
      homePoints: game.homePoints,
      spread: game.spread,
      startingSpread: game.startingSpread,
      awayId: game.awayId,
      awayTeam: game.awayTeam.name,
      awayPoints: game.awayPoints,
      resultId: game.resultId,
      resultTeam: game.resultTeam?.name || null,
      venue: game.venue
    }));

    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error('Error fetching games:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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