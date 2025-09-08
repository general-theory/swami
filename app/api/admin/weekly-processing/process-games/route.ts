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

    // First, find the Week table's id based on the week number
    const week = await prisma.week.findFirst({
      where: { week: weekNumber },
      select: { id: true }
    });

    if (!week) {
      return new NextResponse(`Week ${weekNumber} not found`, { status: 404 });
    }

    // Call the stored procedure using the Week table's id
    const result = await prisma.$executeRaw`CALL UpdateGameResultsForWeek(${week.id})`;

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