import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db/prisma';
import { getCommissionerLeagueIds } from '../../../../../../lib/db/commissioners';
import { calculateBetLimits } from '../../../../../../lib/db/participation';

async function resolveAccess(clerkUserId: string, leagueId: number) {
  const currentUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!currentUser) return null;
  if (currentUser.admin) return currentUser;
  const commissionerLeagueIds = await getCommissionerLeagueIds(currentUser.id);
  if (!commissionerLeagueIds.includes(leagueId)) return null;
  return currentUser;
}

async function getActiveWeek() {
  const activeSeason = await prisma.season.findFirst({
    where: { active: true },
    select: { id: true },
  });
  if (!activeSeason) return null;

  const activeWeek = await prisma.week.findFirst({
    where: { seasonId: activeSeason.id, active: true },
  });
  if (!activeWeek) return null;

  return { activeSeason, activeWeek };
}

// Returns the league's Lock pick for the current active week, if one has been set.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const leagueId = parseInt(id);

    const currentUser = await resolveAccess(userId, leagueId);
    if (!currentUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const active = await getActiveWeek();
    if (!active) {
      return NextResponse.json({ pick: null });
    }

    const lockPick = await prisma.lockPick.findUnique({
      where: { leagueId_weekId: { leagueId, weekId: active.activeWeek.id } },
      include: {
        game: {
          include: {
            homeTeam: { select: { id: true, name: true, rank: true } },
            awayTeam: { select: { id: true, name: true, rank: true } },
          },
        },
        wager: { select: { amount: true } },
      },
    });

    return NextResponse.json({
      pick: lockPick
        ? {
            gameId: lockPick.gameId,
            pick: lockPick.pick,
            amount: lockPick.wager?.amount ?? 0,
            game: lockPick.game,
          }
        : null,
      wagersAllowed: active.activeWeek.wagersAllowed,
    });
  } catch (error) {
    console.error('Error fetching league lock pick:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Sets (or changes) the league's Lock pick for the current active week and
// auto-places/updates the underlying Wager for the league's Lock entrant.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const leagueId = parseInt(id);

    const currentUser = await resolveAccess(userId, leagueId);
    if (!currentUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { gameId, pick } = await request.json();
    if (!gameId || (pick !== 'home' && pick !== 'visit')) {
      return new NextResponse('gameId and a valid pick are required', { status: 400 });
    }

    const active = await getActiveWeek();
    if (!active) {
      return new NextResponse('No active week found', { status: 400 });
    }
    if (!active.activeWeek.wagersAllowed) {
      return new NextResponse('Wagers are locked for this week', { status: 403 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.weekId !== active.activeWeek.id) {
      return new NextResponse('Game not found in the active week', { status: 404 });
    }
    if (new Date() >= game.startDate) {
      return new NextResponse('This game has already kicked off', { status: 403 });
    }

    const lockParticipation = await prisma.userParticipation.findFirst({
      where: { leagueId, seasonId: active.activeSeason.id, isLock: true },
    });
    if (!lockParticipation) {
      return new NextResponse('This league has no Lock entrant set up yet', { status: 400 });
    }

    const { minBet, isOutOfGame } = calculateBetLimits(lockParticipation.balance);
    if (isOutOfGame) {
      return new NextResponse('The Lock is out of the game and cannot place wagers', { status: 403 });
    }

    const existingLockPick = await prisma.lockPick.findUnique({
      where: { leagueId_weekId: { leagueId, weekId: active.activeWeek.id } },
    });

    let wagerId: number;
    if (existingLockPick) {
      if (existingLockPick.gameId === gameId) {
        const updatedWager = await prisma.wager.update({
          where: { id: existingLockPick.wagerId! },
          data: { pick, amount: minBet },
        });
        wagerId = updatedWager.id;
      } else {
        await prisma.wager.delete({ where: { id: existingLockPick.wagerId! } });
        const newWager = await prisma.wager.create({
          data: {
            userId: lockParticipation.userId,
            gameId,
            leagueId,
            pick,
            amount: minBet,
          },
        });
        wagerId = newWager.id;
      }
      await prisma.lockPick.update({
        where: { id: existingLockPick.id },
        data: { gameId, pick, wagerId, setByUserId: currentUser.id },
      });
    } else {
      const newWager = await prisma.wager.create({
        data: {
          userId: lockParticipation.userId,
          gameId,
          leagueId,
          pick,
          amount: minBet,
        },
      });
      wagerId = newWager.id;
      await prisma.lockPick.create({
        data: {
          leagueId,
          weekId: active.activeWeek.id,
          gameId,
          pick,
          wagerId,
          setByUserId: currentUser.id,
        },
      });
    }

    return NextResponse.json({ gameId, pick, amount: minBet });
  } catch (error) {
    console.error('Error setting league lock pick:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Clears the league's Lock pick (and its Wager) for the current active week.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const leagueId = parseInt(id);

    const currentUser = await resolveAccess(userId, leagueId);
    if (!currentUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const active = await getActiveWeek();
    if (!active) {
      return new NextResponse('No active week found', { status: 400 });
    }
    if (!active.activeWeek.wagersAllowed) {
      return new NextResponse('Wagers are locked for this week', { status: 403 });
    }

    const existingLockPick = await prisma.lockPick.findUnique({
      where: { leagueId_weekId: { leagueId, weekId: active.activeWeek.id } },
    });
    if (!existingLockPick) {
      return new NextResponse(null, { status: 204 });
    }

    await prisma.lockPick.delete({ where: { id: existingLockPick.id } });
    if (existingLockPick.wagerId) {
      await prisma.wager.delete({ where: { id: existingLockPick.wagerId } });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error clearing league lock pick:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
