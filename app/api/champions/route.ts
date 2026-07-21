import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = Number(searchParams.get('leagueId'));
    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId is required' }, { status: 400 });
    }

    const champions = await prisma.champion.findMany({
      where: { leagueId },
      include: {
        user: { select: { firstName: true, lastName: true, nickName: true, email: true } },
        season: { select: { year: true } },
      },
      orderBy: { season: { year: 'desc' } },
    });

    const result = champions.map((c, index) => ({
      id: c.id,
      year: c.season.year,
      photoUrl: c.photoUrl,
      displayName: c.user.nickName || `${c.user.firstName} ${c.user.lastName}`.trim() || c.user.email,
      isCurrent: index === 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching champions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
