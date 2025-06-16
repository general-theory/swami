import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    // Ensure params is resolved
    const resolvedParams = await Promise.resolve(params);
    const seasonId = parseInt(resolvedParams.id);
    
    if (isNaN(seasonId)) {
      return NextResponse.json(
        { error: 'Invalid season ID' },
        { status: 400 }
      );
    }

    const weeks = await prisma.week.findMany({
      where: { seasonId },
      orderBy: { week: 'asc' },
    });

    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Error fetching weeks' },
      { status: 500 }
    );
  }
} 