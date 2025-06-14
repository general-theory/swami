import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const participations = await prisma.userParticipation.findMany({
      include: {
        league: {
          select: {
            name: true,
          },
        },
        season: {
          select: {
            name: true,
            year: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();
    const { leagueId, seasonId, userId: participantId, active, balance } = data;

    // Check if participation already exists
    const existingParticipation = await prisma.userParticipation.findUnique({
      where: {
        leagueId_seasonId_userId: {
          leagueId,
          seasonId,
          userId: participantId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Participation already exists' },
        { status: 400 }
      );
    }

    const newParticipation = await prisma.userParticipation.create({
      data: {
        leagueId,
        seasonId,
        userId: participantId,
        active,
        balance,
      },
      include: {
        league: {
          select: {
            name: true,
          },
        },
        season: {
          select: {
            name: true,
            year: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newParticipation);
  } catch (error) {
    console.error('Error creating participation:', error);
    return NextResponse.json(
      { error: 'Error creating participation' },
      { status: 500 }
    );
  }
} 