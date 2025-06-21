import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

interface CFBDTeam {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  division: string;
  logos: string[];
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser?.admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Verify API key exists
    if (!process.env.CFBD_API_KEY) {
      console.error('CFBD_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching teams from CFBD API...');
    // Fetch teams from CFBD API
    const response = await fetch('https://api.collegefootballdata.com/teams/fbs', {
      headers: {
        'Authorization': `Bearer ${process.env.CFBD_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CFBD API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`CFBD API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const teams: CFBDTeam[] = await response.json();
    console.log(`Received ${teams.length} teams from CFBD API`);
    
    let added = 0;
    let updated = 0;

    // Process each team
    for (const team of teams) {
      try {
        const existingTeam = await prisma.team.findUnique({
          where: { providerId: team.id.toString() },
        });

        const teamData = {
          providerId: team.id.toString(),
          name: team.school,
          mascot: team.mascot || 'Unknown',
          abbreviation: team.abbreviation || `Unknown_${team.id}`,
          conference: team.conference || 'Unknown',
          division: team.division || 'Unknown',
          logo: team.logos?.[0] || '',
        };

        if (existingTeam) {
          // Update existing team
          await prisma.team.update({
            where: { id: existingTeam.id },
            data: teamData,
          });
          updated++;
        } else {
          // Create new team
          await prisma.team.create({
            data: teamData,
          });
          added++;
        }
      } catch (error) {
        console.error('Error processing team:', {
          teamId: team.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    }

    console.log(`Sync completed: ${added} added, ${updated} updated`);
    return NextResponse.json({ added, updated });
  } catch (error) {
    console.error('Error syncing teams:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error syncing teams' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // POST method does the same thing as GET for sync operations
  return GET();
} 