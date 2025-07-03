import { prisma } from '../db/prisma';

export interface SyncResult {
  added: number;
  updated: number;
  weekId: number;
  weekNumber: number;
  seasonYear: number;
}

export async function syncGamesForWeek(weekId: number): Promise<SyncResult> {
  // Get the week and season details
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      season: {
        select: { id: true, year: true }
      }
    }
  });

  if (!week) {
    throw new Error(`Week with id ${weekId} not found`);
  }

  if (!week.season) {
    throw new Error(`Season not found for week ${weekId}`);
  }

  console.log(`Starting sync for Week ${week.week}, Season ${week.season.year}`);

  // Fetch games from CFBD API for specific year and week
  const response = await fetch(
    `https://api.collegefootballdata.com/games?year=${week.season.year}&week=${week.week}&seasonType=both&classification=fbs`,
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

  console.log(`Found ${games.length} games from API for Week ${week.week}`);

  // Process each game
  for (const game of games) {
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
      seasonId: week.season.id,
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

  console.log(`Sync completed for Week ${week.week}: ${added} added, ${updated} updated`);

  return {
    added,
    updated,
    weekId: week.id,
    weekNumber: week.week,
    seasonYear: week.season.year
  };
} 