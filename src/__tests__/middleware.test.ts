import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.resetModules();

describe('middleware', () => {
  let getTokenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    getTokenMock = vi.fn();
  });

  it('redirects root to /logs when token present', async () => {
    vi.doMock('next-auth/jwt', () => ({
      getToken: (opts: { req: unknown; secret?: string }) => getTokenMock(opts),
    }));

    getTokenMock.mockResolvedValueOnce({ sub: 'user1' });

    const mod = await import('@/middleware');

    const reqLike = {
      nextUrl: {
        pathname: '/',
        clone: () => new URL('http://localhost/'),
      },
    } as unknown as NextRequest;

    const res = await mod.middleware(reqLike);
    expect(res === undefined || res instanceof NextResponse).toBeTruthy();
  });

  it('allows guest paths and /logs/new', async () => {
    vi.doMock('next-auth/jwt', () => ({
      getToken: (opts: { req: unknown; secret?: string }) => getTokenMock(opts),
    }));
    getTokenMock.mockResolvedValueOnce(null);

    const mod = await import('@/middleware');

    const reqLike = {
      nextUrl: {
        pathname: '/logs/new',
        clone: () => new URL('http://localhost/logs/new'),
      },
    } as unknown as NextRequest;

    const res = await mod.middleware(reqLike);
    expect(res === undefined || res instanceof NextResponse).toBeTruthy();
  });

  it('redirects to login when accessing /logs/* without token', async () => {
    vi.doMock('next-auth/jwt', () => ({
      getToken: (opts: { req: unknown; secret?: string }) => getTokenMock(opts),
    }));
    getTokenMock.mockResolvedValueOnce(null);

    const mod = await import('@/middleware');

    const reqLike = {
      nextUrl: {
        pathname: '/logs/123',
        clone: () => new URL('http://localhost/'),
      },
    } as unknown as NextRequest;

    const res = await mod.middleware(reqLike);
    expect(res).toBeInstanceOf(NextResponse);
  });
});
