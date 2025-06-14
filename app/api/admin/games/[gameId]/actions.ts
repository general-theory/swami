'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/db/prisma';
import { Prisma } from '@prisma/client';

interface GameUpdateData {
  providerGameId?: number | null;
  seasonId: number;
  weekId: number;
  startDate: string;
  completed: boolean;
  neutralSite: boolean;
  homeId: string;
  homePoints?: number | null;
  spread?: number | null;
  startingSpread?: number | null;
  awayId: string;
  awayPoints?: number | null;
  resultId?: string | null;
  venue: string;
}

export async function updateGame(gameId: string, data: GameUpdateData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return { error: 'Unauthorized', status: 401 };
    }

    const {
      providerGameId,
      seasonId,
      weekId,
      startDate,
      completed,
      neutralSite,
      homeId,
      homePoints,
      spread,
      startingSpread,
      awayId,
      awayPoints,
      resultId,
      venue
    } = data;

    const game = await prisma.game.update({
      where: {
        id: parseInt(gameId)
      },
      data: {
        providerGameId: providerGameId ? Number(providerGameId) : null,
        seasonId,
        weekId,
        startDate: new Date(startDate),
        completed,
        neutralSite,
        homeId,
        homePoints,
        spread,
        startingSpread,
        awayId,
        awayPoints,
        resultId,
        venue
      } as Prisma.GameUpdateInput
    });

    return { data: game };
  } catch (error) {
    console.error('Error updating game:', error);
    return { error: 'Internal Server Error', status: 500 };
  }
}

export async function deleteGame(gameId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { admin: true }
    });

    if (!user?.admin) {
      return { error: 'Unauthorized', status: 401 };
    }

    await prisma.game.delete({
      where: {
        id: parseInt(gameId)
      }
    });

    return { status: 204 };
  } catch (error) {
    console.error('Error deleting game:', error);
    return { error: 'Internal Server Error', status: 500 };
  }
} 