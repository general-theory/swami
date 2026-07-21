import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

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

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();
    const { leagueId, userId: championUserId, seasonId, photoUrl } = data;
    const { id } = await params;

    const updatedChampion = await prisma.champion.update({
      where: { id: parseInt(id) },
      data: {
        leagueId: Number(leagueId),
        userId: Number(championUserId),
        seasonId: Number(seasonId),
        photoUrl,
      },
    });

    return NextResponse.json(updatedChampion);
  } catch (error) {
    console.error('Error updating champion:', error);
    return NextResponse.json({ error: 'Error updating champion' }, { status: 500 });
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

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { id } = await params;

    await prisma.champion.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting champion:', error);
    return NextResponse.json({ error: 'Error deleting champion' }, { status: 500 });
  }
}
