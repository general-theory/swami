import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  if (!weekId) return new NextResponse('Missing weekId', { status: 400 });

  const games = await prisma.game.findMany({
    where: { weekId: Number(weekId) },
    select: {
      id: true,
      weekId: true,
      seasonId: true,
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      spread: true,
      homePoints: true,
      awayPoints: true,
      startDate: true,
    },
    orderBy: { startDate: 'asc' },
  });

  return NextResponse.json(games);
} 