import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const seasonId = searchParams.get('seasonId');
    
    if (!leagueId || !seasonId) {
      return new NextResponse('Missing leagueId or seasonId', { status: 400 });
    }

    // Try to get the current user (for authenticated requests)
    const { userId } = await auth();
    
    if (userId) {
      // Authenticated request - return current user's participation
      const currentUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!currentUser) {
        return new NextResponse('User not found', { status: 404 });
      }

      const participation = await prisma.userParticipation.findFirst({
        where: {
          userId: currentUser.id,
          leagueId: Number(leagueId),
          seasonId: Number(seasonId),
          active: true
        }
      });

      if (!participation) {
        return new NextResponse('Participation not found', { status: 404 });
      }

      return NextResponse.json(participation);
    } else {
      // Unauthenticated request - return all participants (for results page)
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
    }
  } catch (error) {
    console.error('Error fetching participation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// export async function GETAll(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const leagueId = searchParams.get('leagueId');
//     const seasonId = searchParams.get('seasonId');
//     if (!leagueId || !seasonId) {
//       return new NextResponse('Missing leagueId or seasonId', { status: 400 });
//     }
//     const participations = await prisma.userParticipation.findMany({
//       where: {
//         leagueId: Number(leagueId),
//         seasonId: Number(seasonId),
//         active: true
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             nickName: true,
//             email: true
//           }
//         }
//       }
//     });
//     const users = participations.map(p => p.user);
//     return NextResponse.json(users);
//   } catch (error) {
//     console.error('Error fetching participants:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// } 