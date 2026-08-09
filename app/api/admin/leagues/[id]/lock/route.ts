import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';
import { getCommissionerLeagueIds } from '../../../../../lib/db/commissioners';

async function resolveAccess(clerkUserId: string, leagueId: number) {
  const currentUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!currentUser) return null;
  if (currentUser.admin) return currentUser;
  const commissionerLeagueIds = await getCommissionerLeagueIds(currentUser.id);
  if (!commissionerLeagueIds.includes(leagueId)) return null;
  return currentUser;
}

// Returns the league's Lock entrant for the current active season, if set up.
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

    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });
    if (!activeSeason) {
      return NextResponse.json({ exists: false, reason: 'No active season' });
    }

    const lockParticipation = await prisma.userParticipation.findFirst({
      where: { leagueId, seasonId: activeSeason.id, isLock: true },
      include: { user: { select: { id: true, nickName: true } } },
    });

    if (!lockParticipation) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      participationId: lockParticipation.id,
      displayName: lockParticipation.user.nickName,
      balance: lockParticipation.balance,
      active: lockParticipation.active,
    });
  } catch (error) {
    console.error('Error fetching league lock:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Creates the league's Lock entrant if it doesn't exist yet, or renames it /
// carries it forward into a new season if it already does. Idempotent so the
// same form can be used for initial setup and later renames.
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

    const { displayName } = await request.json();
    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return new NextResponse('displayName is required', { status: 400 });
    }

    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) {
      return new NextResponse('League not found', { status: 404 });
    }

    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });
    if (!activeSeason) {
      return new NextResponse('No active season found', { status: 400 });
    }

    // Reuse the league's existing Lock user across seasons if one already exists.
    const existingLockParticipation = await prisma.userParticipation.findFirst({
      where: { leagueId, isLock: true },
      select: { userId: true },
    });

    const lockUser = existingLockParticipation
      ? await prisma.user.update({
          where: { id: existingLockParticipation.userId },
          data: { nickName: displayName.trim() },
        })
      : await prisma.user.create({
          data: {
            clerkId: `lock-league-${leagueId}`,
            email: `lock-league-${leagueId}@swami.internal`,
            nickName: displayName.trim(),
          },
        });

    const lockParticipation = await prisma.userParticipation.upsert({
      where: {
        leagueId_seasonId_userId: {
          leagueId,
          seasonId: activeSeason.id,
          userId: lockUser.id,
        },
      },
      update: {},
      create: {
        leagueId,
        seasonId: activeSeason.id,
        userId: lockUser.id,
        isLock: true,
        balance: 1000,
      },
    });

    return NextResponse.json({
      exists: true,
      participationId: lockParticipation.id,
      displayName: lockUser.nickName,
      balance: lockParticipation.balance,
      active: lockParticipation.active,
    });
  } catch (error) {
    console.error('Error setting up league lock:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
