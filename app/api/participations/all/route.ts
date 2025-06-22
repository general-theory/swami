import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const seasonId = searchParams.get('seasonId');
    
    if (!leagueId || !seasonId) {
      return new NextResponse('Missing leagueId or seasonId', { status: 400 });
    }

    const participations = await prisma.userParticipation.findMany({
      where: {
        leagueId: Number(leagueId),
        seasonId: Number(seasonId),
        active: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickName: true,
            email: true
          }
        }
      }
    });

    const users = participations.map(p => p.user);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching all participants:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 