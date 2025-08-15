import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';

interface PlayerWithBets {
  userId: string;
  userName: string;
  userEmail: string;
  leagueId: number;
  leagueName: string;
  balance: number;
  minBet: number;
  currentBetTotal: number;
  shortfall: number;
}

interface ParticipationWithUser {
  userId: number;
  leagueId: number;
  balance: number;
  user: {
    clerkId: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  league: {
    id: number;
    name: string;
  };
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true },
    });

    if (!user?.admin) {
      return new NextResponse('Forbidden - Admin access required', { status: 403 });
    }

    // Get the active season and week
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });

    if (!activeSeason) {
      return NextResponse.json({ added: 0, updated: 0, skipped: 0, message: 'No active season found' });
    }

    const activeWeek = await prisma.week.findFirst({
      where: {
        seasonId: activeSeason.id,
        active: true,
      },
      select: { id: true },
    });

    if (!activeWeek) {
      return NextResponse.json({ added: 0, updated: 0, skipped: 0, message: 'No active week found' });
    }

    // Get all games for the active week
    const games = await prisma.game.findMany({
      where: {
        weekId: activeWeek.id,
        active: true,
      },
      select: {
        id: true,
        spread: true,
        homeId: true,
        awayId: true,
      },
    });

    if (games.length === 0) {
      return NextResponse.json({ added: 0, updated: 0, skipped: 0, message: 'No active games found for this week' });
    }

    // Find the default game (largest absolute spread)
    const defaultGame = games.reduce((largest, current) => {
      const currentAbs = Math.abs(current.spread || 0);
      const largestAbs = Math.abs(largest.spread || 0);
      return currentAbs > largestAbs ? current : largest;
    });

    if (!defaultGame.spread) {
      return NextResponse.json({ added: 0, updated: 0, skipped: 0, message: 'No games with spreads found' });
    }

    // Determine which team is favored
    const isHomeFavored = defaultGame.spread < 0;
    const favoredTeam = isHomeFavored ? 'home' : 'visit';

    // Get all participations for the active season
    const participations = await prisma.userParticipation.findMany({
      where: {
        seasonId: activeSeason.id,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
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

    // Get all wagers for the active week
    const weekWagers = await prisma.wager.findMany({
      where: {
        game: {
          weekId: activeWeek.id,
        },
      },
      select: {
        id: true,
        userId: true,
        leagueId: true,
        gameId: true,
        pick: true,
        amount: true,
      },
    });

    // Calculate bet totals by user and league
    const betTotals = new Map<string, number>();
    weekWagers.forEach(wager => {
      const key = `${wager.userId}-${wager.leagueId}`;
      betTotals.set(key, (betTotals.get(key) || 0) + wager.amount);
    });

    // Define calculateBetLimits function locally
    function calculateBetLimits(balance: number) {
      let minBet = 0;
      if (balance > 0) {
        minBet = Math.ceil((balance / 2) / 10) * 10;
      }
      const maxBet = Math.abs(balance) + 1000;
      return { minBet, maxBet };
    }

    // Process participations and identify users who need default bets
    const usersNeedingBets: PlayerWithBets[] = [];

    participations.forEach((participation: ParticipationWithUser) => {
      const key = `${participation.userId}-${participation.leagueId}`;
      const currentBetTotal = betTotals.get(key) || 0;
      const { minBet } = calculateBetLimits(participation.balance);

      if (currentBetTotal < minBet) {
        usersNeedingBets.push({
          userId: participation.user.clerkId,
          userEmail: participation.user.email,
          userName: `${participation.user.firstName || ''} ${participation.user.lastName || ''}`.trim() || participation.user.email,
          leagueId: participation.league.id,
          leagueName: participation.league.name,
          balance: participation.balance,
          minBet,
          currentBetTotal,
          shortfall: minBet - currentBetTotal,
        });
      }
    });

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each user who needs a default bet
    for (const user of usersNeedingBets) {
      try {
        // Find the user's ID in the database
        const dbUser = await prisma.user.findUnique({
          where: { clerkId: user.userId },
          select: { id: true },
        });

        if (!dbUser) {
          console.error(`User not found: ${user.userId}`);
          skippedCount++;
          continue;
        }

        // Check if user already has a wager on the default game for this league
        const existingWager = weekWagers.find(w => 
          w.userId === dbUser.id && 
          w.leagueId === user.leagueId && 
          w.gameId === defaultGame.id
        );

        if (existingWager) {
          // User already has a wager on this game
          if (existingWager.pick === favoredTeam) {
            // They bet on the favored team, so we can add to their wager
            await prisma.wager.update({
              where: { id: existingWager.id },
              data: { amount: existingWager.amount + user.shortfall },
            });
            updatedCount++;
            console.log(`Updated wager for ${user.userName}: +$${user.shortfall}`);
          } else {
            // They bet on the underdog team, skip this user
            skippedCount++;
            console.log(`Skipped ${user.userName}: bet on underdog team`);
          }
        } else {
          // User has no wager on this game, create a new one
          await prisma.wager.create({
            data: {
              userId: dbUser.id,
              gameId: defaultGame.id,
              leagueId: user.leagueId,
              pick: favoredTeam,
              amount: user.shortfall,
            },
          });
          addedCount++;
          console.log(`Added new wager for ${user.userName}: $${user.shortfall} on ${favoredTeam} team`);
        }

      } catch (error) {
        console.error(`Failed to process default bet for ${user.userName}:`, error);
        skippedCount++;
      }
    }

    return NextResponse.json({
      added: addedCount,
      updated: updatedCount,
      skipped: skippedCount,
      message: `Default bets processed: ${addedCount} added, ${updatedCount} updated, ${skippedCount} skipped`,
    });

  } catch (error) {
    console.error('Error adding default bets:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 