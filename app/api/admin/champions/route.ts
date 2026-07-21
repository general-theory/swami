import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET() {
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

    const champions = await prisma.champion.findMany({
      include: {
        league: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, nickName: true, email: true } },
        season: { select: { id: true, year: true } },
      },
      orderBy: [{ season: { year: 'desc' } }, { league: { name: 'asc' } }],
    });

    return NextResponse.json(champions);
  } catch (error) {
    console.error('Error fetching champions:', error);
    return NextResponse.json({ error: 'Error fetching champions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!leagueId || !championUserId || !seasonId || !photoUrl) {
      return NextResponse.json({ error: 'leagueId, userId, seasonId, and photoUrl are required' }, { status: 400 });
    }

    const newChampion = await prisma.champion.create({
      data: {
        leagueId: Number(leagueId),
        userId: Number(championUserId),
        seasonId: Number(seasonId),
        photoUrl,
      },
    });

    return NextResponse.json(newChampion);
  } catch (error) {
    console.error('Error creating champion:', error);
    return NextResponse.json({ error: 'Error creating champion' }, { status: 500 });
  }
}
