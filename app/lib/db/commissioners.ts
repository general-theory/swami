import { prisma } from './prisma';

export async function getCommissionerLeagueIds(userId: number): Promise<number[]> {
  const rows = await prisma.leagueCommissioner.findMany({
    where: { userId },
    select: { leagueId: true },
  });
  return rows.map((row) => row.leagueId);
}
