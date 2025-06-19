import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET() {
  try {
    // Get active season
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true }
    });
    if (!activeSeason) {
      return NextResponse.json([]);
    }
    // Get weeks for active season where wagersAllowed is false
    const weeks = await prisma.week.findMany({
      where: {
        seasonId: activeSeason.id,
        wagersAllowed: false
      },
      select: {
        id: true,
        week: true
      },
      orderBy: {
        week: 'desc'
      }
    });
    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 