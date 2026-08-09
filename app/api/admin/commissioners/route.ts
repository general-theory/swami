import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET() {
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

    const commissioners = await prisma.leagueCommissioner.findMany({
      include: {
        league: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, nickName: true, email: true } },
      },
      orderBy: [{ league: { name: 'asc' } }],
    });

    return NextResponse.json(commissioners);
  } catch (error) {
    console.error('Error fetching commissioners:', error);
    return NextResponse.json({ error: 'Error fetching commissioners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!leagueId || !commissionerUserId) {
      return NextResponse.json({ error: 'leagueId and userId are required' }, { status: 400 });
    }

    const newCommissioner = await prisma.leagueCommissioner.create({
      data: {
        leagueId: Number(leagueId),
        userId: Number(commissionerUserId),
      },
    });

    return NextResponse.json(newCommissioner);
  } catch (error) {
    console.error('Error creating commissioner:', error);
    return NextResponse.json({ error: 'Error creating commissioner' }, { status: 500 });
  }
}
