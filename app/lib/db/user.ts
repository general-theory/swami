import { prisma } from './prisma';
import type { User, Prisma } from '@prisma/client';

export async function createUser(
  clerkId: string,
  email: string,
  firstName: string,
  lastName: string,
  admin: boolean = false  // Default to false
): Promise<User> {
  try {
    const userData: Prisma.UserCreateInput = {
      clerkId,
      email,
      firstName,
      lastName,
      admin,
      nickName: ''
    };

    const user = await prisma.user.create({
      data: userData
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
  });
} 