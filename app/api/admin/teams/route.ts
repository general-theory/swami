import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
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

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        conference: true,
        mascot: true,
        abbreviation: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error fetching teams' },
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
    const { providerId, name, conference, mascot, abbreviation, division, logo } = data;

    const newTeam = await prisma.team.create({
      data: {
        providerId,
        name,
        conference,
        mascot,
        abbreviation,
        division,
        logo,
      },
    });

    return NextResponse.json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Error creating team' },
      { status: 500 }
    );
  }
} 