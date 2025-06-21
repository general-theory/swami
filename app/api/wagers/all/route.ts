import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get('weekId');
  const leagueId = searchParams.get('leagueId');
  if (!weekId || !leagueId) {
    return new NextResponse('Missing weekId or leagueId', { status: 400 });
  }

  const wagers = await prisma.wager.findMany({
    where: {
      leagueId: Number(leagueId),
      game: { weekId: Number(weekId) }
    },
    select: {
      userId: true,
      gameId: true,
      pick: true,
      amount: true,
      balanceImpact: true
    }
  });

  return NextResponse.json(wagers);
} 