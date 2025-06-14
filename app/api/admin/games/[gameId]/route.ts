import { NextRequest } from 'next/server';
import { updateGame, deleteGame } from './actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface RouteContext {
  params: Promise<{
    gameId: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { gameId } = await context.params;
  const body = await request.json();
  const result = await updateGame(gameId, body);
  
  if (result.error) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  
  return Response.json(result.data);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { gameId } = await context.params;
  const result = await deleteGame(gameId);
  
  if (result.error) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  
  return new Response(null, { status: result.status });
} 