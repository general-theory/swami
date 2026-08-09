import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';
import { getCommissionerLeagueIds } from '../../../../lib/db/commissioners';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();
    const { leagueId, seasonId, userId: participantId, active, balance } = data;
    const { id } = await params;
    const participationId = parseInt(id);

    // Admins can edit any participation; commissioners can only edit participations
    // in leagues they're assigned to, and can't move one into a league they don't control
    if (!currentUser.admin) {
      const existingParticipation = await prisma.userParticipation.findUnique({
        where: { id: participationId },
      });

      if (!existingParticipation) {
        return new NextResponse('Not Found', { status: 404 });
      }

      const commissionerLeagueIds = await getCommissionerLeagueIds(currentUser.id);
      if (
        !commissionerLeagueIds.includes(existingParticipation.leagueId) ||
        !commissionerLeagueIds.includes(Number(leagueId))
      ) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Check if the new combination would create a duplicate
    const duplicateParticipation = await prisma.userParticipation.findFirst({
      where: {
        leagueId,
        seasonId,
        userId: participantId,
        id: { not: participationId },
      },
    });

    if (duplicateParticipation) {
      return NextResponse.json(
        { error: 'Participation already exists' },
        { status: 400 }
      );
    }

    const updatedParticipation = await prisma.userParticipation.update({
      where: {
        id: participationId,
      },
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

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Error updating participation:', error);
    return NextResponse.json(
      { error: 'Error updating participation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await prisma.userParticipation.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting participation:', error);
    return NextResponse.json(
      { error: 'Error deleting participation' },
      { status: 500 }
    );
  }
} 