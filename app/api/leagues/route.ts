import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db/prisma';

interface League {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

interface Participation {
  leagueId: number;
  active: boolean;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get active season
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true }
    });

    if (!activeSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 400 }
      );
    }

    // Get all leagues
    const leagues = await prisma.league.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
      },
    });

    // Get user's participations for the active season
    const userParticipations = await prisma.userParticipation.findMany({
      where: {
        userId: currentUser.id,
        seasonId: activeSeason.id,
      },
      select: {
        leagueId: true,
        active: true,
      },
    });

    // Map participations to leagues
    const leaguesWithParticipation = leagues.map((league: League) => ({
      ...league,
      isParticipating: userParticipations.some(
        (p: Participation) => p.leagueId === league.id && p.active
      ),
    }));

    return NextResponse.json(leaguesWithParticipation);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Error fetching leagues' },
      { status: 500 }
    );
  }
} 