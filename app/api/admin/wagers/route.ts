import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

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

    const wagers = await prisma.wager.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        game: {
          select: {
            id: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
              },
            },
            season: {
              select: {
                id: true,
                name: true,
              },
            },
            week: {
              select: {
                id: true,
                week: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(wagers);
  } catch (error) {
    console.error('Error fetching wagers:', error);
    return NextResponse.json(
      { error: 'Error fetching wagers' },
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

    const { userId: wagerUserId, gameId, pick, amount } = await request.json();

    // Validate required fields
    if (!wagerUserId || !gameId || !pick || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert IDs to numbers
    const userIdNum = parseInt(wagerUserId);
    const gameIdNum = parseInt(gameId);
    const amountNum = parseFloat(amount);

    if (isNaN(userIdNum) || isNaN(gameIdNum) || isNaN(amountNum)) {
      return NextResponse.json(
        { error: 'Invalid ID or amount format' },
        { status: 400 }
      );
    }

    // Check if the game exists and is not completed
    const game = await prisma.game.findUnique({
      where: { id: gameIdNum },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.completed) {
      return NextResponse.json(
        { error: 'Cannot create wager for completed game' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the wager
    const wager = await prisma.wager.create({
      data: {
        userId: userIdNum,
        gameId: gameIdNum,
        pick,
        amount: amountNum,
        won: undefined,
        balanceImpact: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        game: {
          select: {
            id: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
              },
            },
            season: {
              select: {
                id: true,
                name: true,
              },
            },
            week: {
              select: {
                id: true,
                week: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(wager);
  } catch (error) {
    console.error('Error creating wager:', error);
    return NextResponse.json(
      { error: 'Error creating wager' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const { id, userId: wagerUserId, gameId, pick, amount } = await request.json();

    // Validate required fields
    if (!id || !wagerUserId || !gameId || !pick || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert IDs to numbers
    const wagerId = parseInt(id);
    const userIdNum = parseInt(wagerUserId);
    const gameIdNum = parseInt(gameId);
    const amountNum = parseFloat(amount);

    if (isNaN(wagerId) || isNaN(userIdNum) || isNaN(gameIdNum) || isNaN(amountNum)) {
      return NextResponse.json(
        { error: 'Invalid ID or amount format' },
        { status: 400 }
      );
    }

    // Check if the wager exists
    const existingWager = await prisma.wager.findUnique({
      where: { id: wagerId },
    });

    if (!existingWager) {
      return NextResponse.json(
        { error: 'Wager not found' },
        { status: 404 }
      );
    }

    // Check if the game exists and is not completed
    const game = await prisma.game.findUnique({
      where: { id: gameIdNum },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.completed) {
      return NextResponse.json(
        { error: 'Cannot modify wager for completed game' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the wager
    const updatedWager = await prisma.wager.update({
      where: { id: wagerId },
      data: {
        userId: userIdNum,
        gameId: gameIdNum,
        pick,
        amount: amountNum,
      },
      include: {
        user: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
            season: true,
            week: true,
          },
        },
      },
    });

    return NextResponse.json(updatedWager);
  } catch (error) {
    console.error('Error updating wager:', error);
    return NextResponse.json(
      { error: 'Error updating wager' },
      { status: 500 }
    );
  }
} 