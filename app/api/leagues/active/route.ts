import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
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
      return NextResponse.json([]);
    }

    // Get user's active participations
    const activeParticipations = await prisma.userParticipation.findMany({
      where: {
        userId: currentUser.id,
        seasonId: activeSeason.id,
        active: true
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            description: true,
            active: true
          }
        }
      }
    });

    return NextResponse.json(activeParticipations.map(p => p.league));
  } catch (error) {
    console.error('Error fetching active leagues:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 