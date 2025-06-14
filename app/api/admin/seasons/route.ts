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

    const seasons = await prisma.season.findMany({
      select: {
        id: true,
        name: true,
        year: true,
        active: true,
      },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
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
    const { name, year, active } = data;

    const newSeason = await prisma.season.create({
      data: {
        name,
        year,
        active,
      },
    });

    return NextResponse.json(newSeason);
  } catch (error) {
    console.error('Error creating season:', error);
    return NextResponse.json(
      { error: 'Error creating season' },
      { status: 500 }
    );
  }
} 