import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { gameId, leagueId, pick, amount } = await request.json();
    if (!gameId || !leagueId || !pick || amount === undefined) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    if (typeof amount !== 'number' || amount < 0 || amount % 10 !== 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }
    if (pick !== 'home' && pick !== 'visit') {
      return new NextResponse('Invalid pick', { status: 400 });
    }

    const wager = await prisma.wager.create({
      data: {
        userId: user.id,
        gameId,
        leagueId,
        pick,
        amount
      }
    });
    return NextResponse.json(wager);
  } catch (error) {
    console.error('Error creating wager:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('weekId');
    const leagueId = searchParams.get('leagueId');
    if (!weekId || !leagueId) {
      return new NextResponse('Missing weekId or leagueId', { status: 400 });
    }
    const wagers = await prisma.wager.findMany({
      where: {
        userId: user.id,
        leagueId: Number(leagueId),
        game: { weekId: Number(weekId) }
      },
      select: {
        gameId: true,
        pick: true,
        amount: true
      }
    });
    return NextResponse.json(wagers);
  } catch (error) {
    console.error('Error fetching wagers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    const { gameId, leagueId, pick, amount } = await request.json();
    if (!gameId || !leagueId || !pick || amount === undefined) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    if (typeof amount !== 'number' || amount < 0 || amount % 10 !== 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }
    if (pick !== 'home' && pick !== 'visit') {
      return new NextResponse('Invalid pick', { status: 400 });
    }
    // Find the wager
    const wager = await prisma.wager.findUnique({
      where: {
        userId_gameId_leagueId: {
          userId: user.id,
          gameId,
          leagueId
        }
      }
    });
    if (!wager) {
      return new NextResponse('Wager not found', { status: 404 });
    }
    const updated = await prisma.wager.update({
      where: {
        userId_gameId_leagueId: {
          userId: user.id,
          gameId,
          leagueId
        }
      },
      data: {
        pick,
        amount
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating wager:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 