import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        conference: true,
        mascot: true,
        abbreviation: true,
        division: true,
        rank: true,
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