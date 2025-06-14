import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const updatedWeek = await prisma.week.update({
      where: { id: parseInt(id) },
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
      ...updatedWeek,
      seasonName: updatedWeek.season.name,
      startDate: updatedWeek.startDate.toISOString(),
      endDate: updatedWeek.endDate.toISOString(),
      wagersCutoff: updatedWeek.wagersCutoff.toISOString(),
    };

    return NextResponse.json(transformedWeek);
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Error updating week' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await prisma.week.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting week:', error);
    return NextResponse.json(
      { error: 'Error deleting week' },
      { status: 500 }
    );
  }
} 