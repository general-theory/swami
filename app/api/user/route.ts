import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createUser, getUserByClerkId } from '../../lib/db/user';

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

    return NextResponse.json(user);
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

    // Create new user
    const newUser = await createUser(
      userId,
      userData.email_addresses[0].email_address,
      userData.first_name,
      userData.last_name
    );

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in user creation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 