import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { seasonId, weekId, homeId, awayId, startDate, venue, neutralSite, active, completed, homePoints, awayPoints, spread } = body;
    const resolvedParams = await params;

    console.log('Updating game with data:', body);

    const game = await prisma.game.update({
      where: {
        id: parseInt(resolvedParams.id)
      },
      data: {
        seasonId: parseInt(seasonId),
        weekId: parseInt(weekId),
        homeId,
        awayId,
        startDate: new Date(startDate),
        venue,
        neutralSite,
        active,
        completed,
        homePoints: homePoints ? parseInt(homePoints) : null,
        awayPoints: awayPoints ? parseInt(awayPoints) : null,
        spread: spread ? parseFloat(spread) : null,
      },
      include: {
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
        homeTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 