// getServerToken — next-auth/jwt の getToken に正しく委譲するかを確認
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('lib/auth.getServerToken', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('forwards request and returns token from next-auth/jwt', async () => {
    const getTokenMock = vi.fn().mockResolvedValue({ sub: 'user-1' });

    vi.doMock('next-auth/jwt', () => ({
      getToken: (opts: { req?: unknown; secret?: string }) => getTokenMock(opts),
    }));

    const { getServerToken } = await import('@/lib/auth');

    const reqLike = new Request('http://localhost/test-auth');
    const out = await getServerToken(reqLike);

    expect(out).toEqual({ sub: 'user-1' });

    const firstCallArg = getTokenMock.mock.calls[0][0] as { req?: unknown; secret?: unknown };
    expect(firstCallArg.req).toBeDefined();
    expect(firstCallArg.secret).toEqual(process.env.NEXTAUTH_SECRET);
  });
});
