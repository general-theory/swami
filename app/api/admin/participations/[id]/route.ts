import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function PUT(
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

    const data = await request.json();
    const { leagueId, seasonId, userId: participantId, active, balance } = data;
    const { id } = await params;

    // Check if the new combination would create a duplicate
    const existingParticipation = await prisma.userParticipation.findFirst({
      where: {
        leagueId,
        seasonId,
        userId: participantId,
        id: { not: parseInt(id) },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Participation already exists' },
        { status: 400 }
      );
    }

    const updatedParticipation = await prisma.userParticipation.update({
      where: {
        id: parseInt(id),
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