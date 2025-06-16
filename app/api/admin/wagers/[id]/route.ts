import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { userId: wagerUserId, gameId, leagueId, pick, amount, won, balanceImpact } = body;
    const resolvedParams = await params;

    console.log('Updating wager with data:', { won, type: typeof won }); // Debug log

    // First get the current wager to preserve balanceImpact
    const currentWager = await prisma.wager.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    });

    if (!currentWager) {
      return new NextResponse('Wager not found', { status: 404 });
    }

    // Then update the wager
    await prisma.$executeRaw`
      UPDATE Wager 
      SET userId = ${parseInt(wagerUserId)},
          gameId = ${parseInt(gameId)},
          leagueId = ${parseInt(leagueId)},
          pick = ${pick},
          amount = ${parseInt(amount)},
          won = ${won === 'true'},
          balanceImpact = ${balanceImpact !== undefined ? parseInt(balanceImpact) : currentWager.balanceImpact}
      WHERE id = ${parseInt(resolvedParams.id)}
    `;

    // Then fetch the updated wager with relations
    const wager = await prisma.wager.findUnique({
      where: {
        id: parseInt(resolvedParams.id)
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
            awayTeam: {
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
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!wager) {
      return new NextResponse('Wager not found', { status: 404 });
    }

    return NextResponse.json(wager);
  } catch (error) {
    console.error('Error updating wager:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;

    await prisma.wager.delete({
      where: {
        id: parseInt(resolvedParams.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting wager:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 