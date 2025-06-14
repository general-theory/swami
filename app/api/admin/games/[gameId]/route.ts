import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { gameId: string } }
) {
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

    const game = await prisma.game.update({
      where: {
        id: parseInt(params.gameId)
      },
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
      } as Prisma.GameUpdateInput
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { gameId: string } }
) {
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

    await prisma.game.delete({
      where: {
        id: parseInt(params.gameId)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 