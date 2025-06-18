import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the internal user record by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get active participations for this user, include league info
    const participations = await prisma.userParticipation.findMany({
      where: {
        userId: user.id,
        active: true
      },
      include: {
        league: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Map to just league info
    const leagues = participations.map(p => p.league);
    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching active leagues:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 