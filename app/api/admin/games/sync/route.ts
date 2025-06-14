import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function POST() {
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

    // Get the active season to determine the year
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

    // Fetch games from CFBD API
    const response = await fetch(
      `https://api.collegefootballdata.com/games?year=${activeSeason.year}&seasonType=both&classification=fbs`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CFBD_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    let added = 0;
    let updated = 0;

    // Process each game
    for (const game of games) {
      console.log('Game data:', {
        id: game.id,
        home_points: game.home_points,
        away_points: game.away_points,
        homePoints: game.homePoints,
        awayPoints: game.awayPoints
      });

      // Find the season
      const season = await prisma.season.findFirst({
        where: { year: game.season },
        select: { id: true }
      });

      if (!season) {
        console.warn(`Season not found for year ${game.season}`);
        continue;
      }

      // Find the week
      const week = await prisma.week.findFirst({
        where: {
          seasonId: season.id,
          week: game.week
        },
        select: { id: true }
      });

      if (!week) {
        console.warn(`Week ${game.week} not found for season ${game.season}`);
        continue;
      }

      // Find the teams
      const [homeTeam, awayTeam] = await Promise.all([
        prisma.team.findFirst({
          where: { providerId: game.homeId.toString() },
          select: { id: true }
        }),
        prisma.team.findFirst({
          where: { providerId: game.awayId.toString() },
          select: { id: true }
        })
      ]);

      if (!homeTeam || !awayTeam) {
        console.warn(`Team not found for game ${game.id}`);
        continue;
      }

      // Check if game exists
      const existingGame = await prisma.game.findFirst({
        where: { providerGameId: Number(game.id) }
      });

      const gameData = {
        providerGameId: Number(game.id),
        seasonId: season.id,
        weekId: week.id,
        homeId: homeTeam.id,
        awayId: awayTeam.id,
        startDate: new Date(game.startDate),
        completed: game.completed,
        neutralSite: game.neutralSite,
        venue: game.venue,
        homePoints: game.homePoints ? Number(game.homePoints) : 0,
        awayPoints: game.awayPoints ? Number(game.awayPoints) : 0
      };

      console.log('Game data to save:', gameData);

      if (existingGame) {
        // Update existing game
        await prisma.game.update({
          where: { id: existingGame.id },
          data: gameData
        });
        updated++;
      } else {
        // Create new game
        await prisma.game.create({
          data: gameData
        });
        added++;
      }
    }

    return NextResponse.json({
      message: 'Games synced successfully',
      added,
      updated
    });
  } catch (error) {
    console.error('Error syncing games:', error);
    return NextResponse.json(
      { error: 'Error syncing games' },
      { status: 500 }
    );
  }
} 