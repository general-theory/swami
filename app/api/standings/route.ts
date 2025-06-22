import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db/prisma';
import { calculateBetLimits } from '../../lib/db/participation';

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

    // Get user's active leagues
    const userLeagues = await prisma.userParticipation.findMany({
      where: {
        userId: currentUser.id,
        active: true,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get all standings
    const standings = await prisma.userParticipation.findMany({
      where: {
        active: true,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
        user: {
          select: {
            nickName: true,
            email: true,
            firstName: true,
            lastName: true,
            favTeamId: true,
            favoriteTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to use email if nickname is empty and calculate bet limits
    const transformedStandings = standings.map(standing => {
      const { minBet, maxBet } = calculateBetLimits(standing.balance);
      return {
        id: standing.id,
        league: standing.league,
        user: {
          ...standing.user,
          displayName: standing.user.nickName || 
                      `${standing.user.firstName} ${standing.user.lastName}`.trim() || 
                      standing.user.email
        },
        balance: standing.balance,
        minBet,
        maxBet,
      };
    });

    // Transform user leagues for the dropdown (separate query to avoid type conflicts)
    const leagues = userLeagues.map(up => ({
      id: up.league.id,
      name: up.league.name,
    }));

    return NextResponse.json({
      standings: transformedStandings,
      userLeagues: leagues,
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 