import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true },
    });

    if (!user?.admin) {
      return new NextResponse('Forbidden - Admin access required', { status: 403 });
    }

    const { weekNumber } = await request.json();

    if (!weekNumber || typeof weekNumber !== 'number') {
      return new NextResponse('Week number is required and must be a number', { status: 400 });
    }

    // Call the stored procedure using Prisma's $executeRaw
    const result = await prisma.$executeRaw`CALL UpdateGameResultsForWeek(${weekNumber})`;

    return NextResponse.json({
      success: true,
      message: `Successfully processed games for Week ${weekNumber}`,
      weekNumber,
      result,
    });

  } catch (error) {
    console.error('Error processing completed games:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 