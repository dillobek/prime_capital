import { NextRequest, NextResponse } from 'next/server';

const backend = process.env.API_URL ?? 'http://backend:4000/api/v1';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${backend}/${path.join('/')}${request.nextUrl.search}`;
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();
  const response = await fetch(target, {
    method: request.method,
    headers: {
      'content-type': request.headers.get('content-type') ?? 'application/json',
      ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {}),
    },
    body,
    cache: 'no-store',
  });
  return new NextResponse(response.body, { status: response.status, headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' } });
}

export const GET = proxy; export const POST = proxy; export const PATCH = proxy; export const DELETE = proxy;
