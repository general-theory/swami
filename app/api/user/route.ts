import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createUser, getUserByClerkId, getUserByEmail, updateUserClerkId } from '../../lib/db/user';
import { getCommissionerLeagueIds } from '../../lib/db/commissioners';
import { prisma } from '../../lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const commissionerLeagueIds = await getCommissionerLeagueIds(user.id);

    return NextResponse.json({ ...user, commissionerLeagueIds });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user already exists
    const existingUser = await getUserByClerkId(userId);
    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Get user data from Clerk
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Clerk user data: ${response.statusText}`);
    }

    const userData = await response.json();
    const email = userData.email_addresses[0].email_address;

    // The Clerk userId can change (e.g. migrating to a different Clerk
    // instance/plan) even though the person is the same. If we already have
    // a user with this email, re-point it at the new clerkId instead of
    // trying to create a duplicate, which would violate the unique
    // constraint on email.
    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      const updatedUser = await updateUserClerkId(existingByEmail.id, userId);
      return NextResponse.json(updatedUser);
    }

    // Create new user
    const newUser = await createUser(
      userId,
      email,
      userData.first_name || '',
      userData.last_name || ''
    );

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in user creation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, nickName, favTeamId } = body;

    // Get current user
    const currentUser = await getUserByClerkId(userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        nickName: nickName || null,
        favTeamId: favTeamId || null,
      },
      include: {
        favoriteTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 