import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const seasonId = searchParams.get('seasonId');
    if (!leagueId || !seasonId) {
      return new NextResponse('Missing leagueId or seasonId', { status: 400 });
    }
    const participation = await prisma.userParticipation.findUnique({
      where: {
        leagueId_seasonId_userId: {
          leagueId: Number(leagueId),
          seasonId: Number(seasonId),
          userId: user.id
        }
      },
      select: { balance: true }
    });
    if (!participation) {
      return new NextResponse('Participation not found', { status: 404 });
    }
    return NextResponse.json(participation);
  } catch (error) {
    console.error('Error fetching participation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 