import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();
    const { leagueId, userId: commissionerUserId } = data;
    const { id } = await params;

    const updatedCommissioner = await prisma.leagueCommissioner.update({
      where: { id: parseInt(id) },
      data: {
        leagueId: Number(leagueId),
        userId: Number(commissionerUserId),
      },
    });

    return NextResponse.json(updatedCommissioner);
  } catch (error) {
    console.error('Error updating commissioner:', error);
    return NextResponse.json({ error: 'Error updating commissioner' }, { status: 500 });
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

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { id } = await params;

    await prisma.leagueCommissioner.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting commissioner:', error);
    return NextResponse.json({ error: 'Error deleting commissioner' }, { status: 500 });
  }
}
