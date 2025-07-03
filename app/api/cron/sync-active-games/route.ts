import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';
import { syncGamesForWeek } from '../../../../lib/sync/games';

export async function GET() {
  try {
    console.log('Cron job: Starting active games sync check');

    // Find the most recent week with activeSync = true
    const activeWeek = await prisma.week.findFirst({
      where: { activeSync: true },
      orderBy: { id: 'desc' },
      include: {
        season: {
          select: { id: true, year: true }
        }
      }
    });

    if (!activeWeek) {
      console.log('Cron job: No weeks found with activeSync = true');
      return NextResponse.json({
        message: 'No active sync weeks found',
        synced: false
      });
    }

    console.log(`Cron job: Found active week - Week ${activeWeek.week}, Season ${activeWeek.season?.year}`);

    // Sync games for this week
    const result = await syncGamesForWeek(activeWeek.id);

    console.log(`Cron job: Sync completed successfully - ${result.added} added, ${result.updated} updated`);

    return NextResponse.json({
      message: 'Active games sync completed successfully',
      synced: true,
      result
    });

  } catch (error) {
    console.error('Cron job: Error syncing active games:', error);
    return NextResponse.json(
      { 
        message: 'Error syncing active games',
        error: error instanceof Error ? error.message : 'Unknown error',
        synced: false
      },
      { status: 500 }
    );
  }
} 