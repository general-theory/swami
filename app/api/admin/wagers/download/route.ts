import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

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
      orderBy: [
        { game: { season: { name: 'asc' } } },
        { game: { week: { week: 'asc' } } },
        { createdAt: 'desc' },
      ],
    });

    // Create CSV content
    const csvHeaders = [
      'Wager ID',
      'User ID',
      'User Name',
      'Game ID',
      'Home Team',
      'Away Team',
      'Season',
      'Week',
      'League',
      'Pick',
      'Amount',
      'Won',
      'Balance Impact',
      'Created At',
      'Updated At'
    ];

    const csvRows = wagers.map(wager => [
      wager.id,
      wager.userId,
      `${wager.user.firstName} ${wager.user.lastName}`,
      wager.gameId,
      wager.game.homeTeam.name,
      wager.game.awayTeam.name,
      wager.game.season.name,
      wager.game.week.week,
      wager.league.name,
      wager.pick,
      wager.amount,
      wager.won === null ? 'Pending' : wager.won ? 'Won' : 'Lost',
      wager.balanceImpact,
      new Date(wager.createdAt).toLocaleString(),
      new Date(wager.updatedAt).toLocaleString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `all-wagers-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading wagers:', error);
    return NextResponse.json(
      { error: 'Error downloading wagers' },
      { status: 500 }
    );
  }
} 