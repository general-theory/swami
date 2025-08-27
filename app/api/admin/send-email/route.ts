import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailRequest {
  recipients: 'everyone' | 'league' | 'specific';
  leagueId?: number;
  userIds?: string[];
  subject: string;
  body: string;
}

export async function POST(request: Request) {
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

    const body: SendEmailRequest = await request.json();
    const { recipients, leagueId, userIds, subject, body: emailBody } = body;

    if (!subject || !emailBody) {
      return new NextResponse('Subject and body are required', { status: 400 });
    }

    // Get the active season
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
      select: { id: true },
    });

    if (!activeSeason) {
      return new NextResponse('No active season found', { status: 400 });
    }

    // Build the where clause for user participations
    const whereClause: Record<string, unknown> = { 
      seasonId: activeSeason.id,
      active: true  // Only include active participants
    };

    if (recipients === 'league' && leagueId) {
      whereClause.leagueId = leagueId;
    } else if (recipients === 'specific' && userIds && userIds.length > 0) {
      whereClause.user = {
        clerkId: { in: userIds }
      };
    }

    // Get users to email
    const participations = await prisma.userParticipation.findMany({
      where: whereClause,
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

    if (participations.length === 0) {
      return NextResponse.json({ 
        sent: 0, 
        message: 'No users found matching the criteria' 
      });
    }

    let sentCount = 0;
    const failedEmails: string[] = [];

    // Send emails using Resend
    for (const participation of participations) {
      try {

        
        const { data, error } = await resend.emails.send({
          from: 'noreply@jeffslucas.com',
          to: participation.user.email,
          subject: subject,
          html: emailBody,
        });

        if (error) {
          console.error(`Failed to send email to ${participation.user.email}:`, error);
          failedEmails.push(participation.user.email);
        } else {
          console.log(`Email sent successfully to ${participation.user.email}:`, data);
          sentCount++;
        }

        // Rate limiting: wait 1 second between emails (1 per second)
        if (sentCount < participations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Failed to send email to ${participation.user.email}:`, error);
        failedEmails.push(participation.user.email);
      }
    }

    return NextResponse.json({
      sent: sentCount,
      failed: failedEmails.length,
      total: participations.length,
      message: `Successfully sent ${sentCount} emails. ${failedEmails.length} failed.`,
      failedEmails,
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 