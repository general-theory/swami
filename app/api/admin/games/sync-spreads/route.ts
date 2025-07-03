import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

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

    const { seasonId, weekId } = await request.json();

    // Get the season year
    let year: number;
    if (seasonId === 'all') {
      const activeSeason = await prisma.season.findFirst({
        where: { active: true },
        select: { year: true }
      });
      if (!activeSeason) {
        return NextResponse.json(
          { error: 'No active season found' },
          { status: 400 }
        );
      }
      year = activeSeason.year;
    } else {
      const season = await prisma.season.findUnique({
        where: { id: parseInt(seasonId) },
        select: { year: true }
      });
      if (!season) {
        return NextResponse.json(
          { error: 'Season not found' },
          { status: 400 }
        );
      }
      year = season.year;
    }

    // Build the API URL
    let url = `https://api.collegefootballdata.com/lines?year=${year}&seasonType=both&provider=Bovada`;
    if (weekId !== 'all') {
      const week = await prisma.week.findUnique({
        where: { id: parseInt(weekId) },
        select: { week: true }
      });
      if (!week) {
        return NextResponse.json(
          { error: 'Week not found' },
          { status: 400 }
        );
      }
      url += `&week=${week.week}`;
    }

    // Fetch spreads from CFBD API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.CFBD_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    let updated = 0;

    // Process each game
    for (const game of games) {
      if (!game.lines || game.lines.length === 0) continue;

      const line = game.lines[0];
      if (!line.spread && !line.spreadOpen) continue;

      // Find the game in our database
      const existingGame = await prisma.game.findFirst({
        where: { providerGameId: Number(game.id) }
      });

      if (existingGame) {
        // Process spread to ensure it's not a whole number
        let processedSpread = line.spread ? Number(line.spread) : undefined;
        
        // If spread is a whole number, add .5 to make it unfavorable to the favored team
        if (processedSpread !== undefined && Number.isInteger(processedSpread)) {
          // Add .5 to the absolute value, maintaining the original sign
          processedSpread = processedSpread > 0 ? processedSpread + 0.5 : processedSpread - 0.5;
        }

        // Update the game with new spread values
        await prisma.game.update({
          where: { id: existingGame.id },
          data: {
            spread: processedSpread,
            startingSpread: line.spreadOpen ? Number(line.spreadOpen) : undefined,
          }
        });
        updated++;
      }
    }

    return NextResponse.json({
      message: 'Spreads synced successfully',
      updated
    });
  } catch (error) {
    console.error('Error syncing spreads:', error);
    return NextResponse.json(
      { error: 'Error syncing spreads' },
      { status: 500 }
    );
  }
} 