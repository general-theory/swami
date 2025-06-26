import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailReminder {
  userId: string;
  userEmail: string;
  userName: string;
  leagueName: string;
  shortfall: number;
}

interface ParticipationWithUser {
  userId: number;
  leagueId: number;
  balance: number;
  user: {
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  league: {
    id: number;
    name: string;
  };
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

    // Get the active season and week
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });

    if (!activeSeason) {
      return NextResponse.json({ sent: 0, skipped: 0, message: 'No active season found' });
    }

    const activeWeek = await prisma.week.findFirst({
      where: {
        seasonId: activeSeason.id,
        active: true,
      },
      select: { id: true },
    });

    if (!activeWeek) {
      return NextResponse.json({ sent: 0, skipped: 0, message: 'No active week found' });
    }

    // Get all participations for the active season
    const participations = await prisma.userParticipation.findMany({
      where: {
        seasonId: activeSeason.id,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get all wagers for the active week
    const weekWagers = await prisma.wager.findMany({
      where: {
        game: {
          weekId: activeWeek.id,
        },
      },
      select: {
        userId: true,
        leagueId: true,
        amount: true,
      },
    });

    // Calculate bet totals by user and league
    const betTotals = new Map<string, number>();
    weekWagers.forEach(wager => {
      const key = `${wager.userId}-${wager.leagueId}`;
      betTotals.set(key, (betTotals.get(key) || 0) + wager.amount);
    });

    // Define calculateBetLimits function locally
    function calculateBetLimits(balance: number) {
      let minBet = 0;
      if (balance > 0) {
        minBet = Math.ceil((balance / 2) / 10) * 10;
      }
      const maxBet = Math.abs(balance) + 1000;
      return { minBet, maxBet };
    }

    // Process participations and identify users who need reminders
    const usersNeedingReminders: EmailReminder[] = [];

    participations.forEach((participation: ParticipationWithUser) => {
      const key = `${participation.userId}-${participation.leagueId}`;
      const currentBetTotal = betTotals.get(key) || 0;
      const { minBet } = calculateBetLimits(participation.balance);

      if (currentBetTotal < minBet) {
        usersNeedingReminders.push({
          userId: participation.user.clerkId,
          userEmail: participation.user.email,
          userName: `${participation.user.firstName} ${participation.user.lastName}`,
          leagueName: participation.league.name,
          shortfall: minBet - currentBetTotal,
        });
      }
    });

    // For now, skip the database check since we haven't migrated yet
    const usersToEmail = usersNeedingReminders; // Email all users who need reminders

    let sentCount = 0;
    const skippedCount = 0;

    // Send emails using Resend
    for (const user of usersToEmail) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'noreply@jeffslucas.com',
          to: user.userEmail,
          subject: 'Swami Reminder',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Swami Reminder</h2>
              <p>Hello ${user.userName},</p>
              <p>This is a reminder to submit your Swami picks as soon as possible.</p>
              <p>You currently have a shortfall of $${user.shortfall} in your minimum bet requirement for the ${user.leagueName} league.</p>
              <p>Please log in to your Swami account and place your wagers before the games begin.</p>
              <br>
              <p>Best regards,<br>The Swami Team</p>
            </div>
          `,
        });

        if (error) {
          console.error(`Failed to send email to ${user.userEmail}:`, error);
        } else {
          console.log(`Email sent successfully to ${user.userEmail}:`, data);
          sentCount++;
        }

      } catch (error) {
        console.error(`Failed to send email to ${user.userEmail}:`, error);
      }
    }

    return NextResponse.json({
      sent: sentCount,
      skipped: skippedCount,
      message: `Successfully sent ${sentCount} reminders.`,
    });

  } catch (error) {
    console.error('Error sending email reminders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 