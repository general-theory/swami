import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const leagueId = parseInt(params.id);

    // Check if league exists
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Check if participation already exists
    const existingParticipation = await prisma.userParticipation.findUnique({
      where: {
        leagueId_seasonId_userId: {
          leagueId,
          seasonId: activeSeason.id,
          userId: currentUser.id,
        },
      },
    });

    if (existingParticipation) {
      // Update existing participation
      await prisma.userParticipation.update({
        where: {
          id: existingParticipation.id,
        },
        data: {
          active: true,
        },
      });
    } else {
      // Create new participation
      await prisma.userParticipation.create({
        data: {
          leagueId,
          seasonId: activeSeason.id,
          userId: currentUser.id,
          active: true,
          balance: 1000.0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json(
      { error: 'Error joining league' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const leagueId = parseInt(params.id);

    // Check if participation exists
    const participation = await prisma.userParticipation.findUnique({
      where: {
        leagueId_seasonId_userId: {
          leagueId,
          seasonId: activeSeason.id,
          userId: currentUser.id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      );
    }

    // Update participation to inactive
    await prisma.userParticipation.update({
      where: {
        id: participation.id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving league:', error);
    return NextResponse.json(
      { error: 'Error leaving league' },
      { status: 500 }
    );
  }
} 