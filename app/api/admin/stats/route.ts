import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
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

    const [users, seasons, leagues, games, teams, weeks, participations, wagers] = await Promise.all([
      prisma.user.count(),
      prisma.season.count(),
      prisma.league.count(),
      prisma.game.count(),
      prisma.team.count(),
      prisma.week.count(),
      prisma.userParticipation.count(),
      prisma.wager.count()
    ]);

    return NextResponse.json({
      users,
      seasons,
      leagues,
      games,
      teams,
      weeks,
      participations,
      wagers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 