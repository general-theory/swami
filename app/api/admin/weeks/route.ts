import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET(request: Request) {
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

    const weeks = await prisma.week.findMany({
      include: {
        season: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transform the data to include seasonName
    const transformedWeeks = weeks.map(week => ({
      ...week,
      seasonName: week.season.name,
      startDate: week.startDate.toISOString(),
      endDate: week.endDate.toISOString(),
      wagersCutoff: week.wagersCutoff.toISOString(),
    }));

    return NextResponse.json(transformedWeeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Error fetching weeks' },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();
    const { seasonId, week, startDate, endDate, wagersAllowed, wagersCutoff, active, activeSync } = data;

    const newWeek = await prisma.week.create({
      data: {
        seasonId: parseInt(seasonId),
        week: parseInt(week),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        wagersAllowed,
        wagersCutoff: new Date(wagersCutoff),
        active,
        activeSync,
      },
      include: {
        season: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transform the response to include seasonName
    const transformedWeek = {
      ...newWeek,
      seasonName: newWeek.season.name,
      startDate: newWeek.startDate.toISOString(),
      endDate: newWeek.endDate.toISOString(),
      wagersCutoff: newWeek.wagersCutoff.toISOString(),
    };

    return NextResponse.json(transformedWeek);
  } catch (error) {
    console.error('Error creating week:', error);
    return NextResponse.json(
      { error: 'Error creating week' },
      { status: 500 }
    );
  }
} 