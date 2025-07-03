import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncGamesForWeek } from '../../../../../lib/sync/games';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const { prisma } = await import('../../../../lib/db/prisma');
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get season and week from request body
    const body = await request.json();
    const { seasonId, weekId } = body;

    if (!seasonId || !weekId) {
      return NextResponse.json(
        { error: 'Season and week are required' },
        { status: 400 }
      );
    }

    // Use the shared sync function
    const result = await syncGamesForWeek(parseInt(weekId));

    return NextResponse.json({
      message: 'Games synced successfully',
      added: result.added,
      updated: result.updated
    });
  } catch (error) {
    console.error('Error syncing games:', error);
    return NextResponse.json(
      { error: 'Error syncing games' },
      { status: 500 }
    );
  }
} 