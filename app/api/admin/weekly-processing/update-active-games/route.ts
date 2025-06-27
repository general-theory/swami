import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../lib/db/prisma';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { weekId, selectedGameIds } = body;

    if (!weekId || !Array.isArray(selectedGameIds)) {
      return NextResponse.json(
        { error: 'Week ID and selected game IDs are required' },
        { status: 400 }
      );
    }

    // First, set all games for this week to inactive
    await prisma.game.updateMany({
      where: { weekId: parseInt(weekId) },
      data: { active: false }
    });

    // Then, set the selected games to active
    if (selectedGameIds.length > 0) {
      await prisma.game.updateMany({
        where: { 
          id: { in: selectedGameIds.map(id => parseInt(id)) },
          weekId: parseInt(weekId)
        },
        data: { active: true }
      });
    }

    return NextResponse.json({
      message: `Successfully updated active games for week ${weekId}. ${selectedGameIds.length} games are now active.`,
      updated: selectedGameIds.length
    });
  } catch (error) {
    console.error('Error updating active games:', error);
    return NextResponse.json(
      { error: 'Error updating active games' },
      { status: 500 }
    );
  }
} 