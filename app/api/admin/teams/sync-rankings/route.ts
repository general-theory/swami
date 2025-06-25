import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

interface RankingWeek {
  week: number;
  polls: Array<{
    poll: string;
    ranks: Array<{
      school: string;
      rank: number;
    }>;
  }>;
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

    // Get the active season year
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { year: true },
    });

    if (!activeSeason) {
      return NextResponse.json({
        updated: 0,
        cleared: 0,
        message: 'No active season found'
      });
    }

    // Fetch rankings from College Football Data API
    const apiKey = process.env.CFBD_API_KEY;
    if (!apiKey) {
      return new NextResponse('CFBD API key not configured', { status: 500 });
    }

    const response = await fetch(
      `https://api.collegefootballdata.com/rankings?year=${activeSeason.year}&seasonType=both`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const rankingsData: RankingWeek[] = await response.json();

    // Check if rankings data is empty
    if (!rankingsData || rankingsData.length === 0) {
      return NextResponse.json({
        updated: 0,
        cleared: 0,
        message: 'No rankings data available for the current season'
      });
    }

    // Find the week with the largest week number
    const latestWeek = rankingsData.reduce((latest, current) => 
      current.week > latest.week ? current : latest
    );

    // Find the AP Top 25 poll
    const apPoll = latestWeek.polls.find(poll => poll.poll === 'AP Top 25');
    
    if (!apPoll) {
      return NextResponse.json({
        updated: 0,
        cleared: 0,
        message: 'AP Top 25 poll not found'
      });
    }

    // Get all teams that currently have a rank
    const teamsWithRank = await prisma.team.findMany({
      where: {
        rank: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        rank: true
      }
    });

    let updated = 0;
    let cleared = 0;

    // Update teams that appear in the rankings
    for (const rankData of apPoll.ranks) {
      const teams = await prisma.team.findMany({
        where: {
          name: rankData.school
        },
        select: {
          id: true
        }
      });

      if (teams.length > 0) {
        await prisma.team.update({
          where: { id: teams[0].id },
          data: { rank: rankData.rank }
        });
        updated++;
      }
    }

    // Clear ranks for teams that are no longer in the top 25
    const rankedTeamNames = apPoll.ranks.map(r => r.school.toLowerCase());
    
    for (const team of teamsWithRank) {
      if (!rankedTeamNames.includes(team.name.toLowerCase())) {
        await prisma.team.update({
          where: { id: team.id },
          data: { rank: null }
        });
        cleared++;
      }
    }

    return NextResponse.json({
      updated,
      cleared,
      message: `Successfully synced rankings for ${activeSeason.year}`
    });

  } catch (error) {
    console.error('Error syncing rankings:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 