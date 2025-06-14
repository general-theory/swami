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

    const leagues = await prisma.league.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
      },
    });

    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
    const { name, description, active } = data;

    const newLeague = await prisma.league.create({
      data: {
        name,
        description,
        active,
      },
    });

    return NextResponse.json(newLeague);
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Error creating league' },
      { status: 500 }
    );
  }
} 