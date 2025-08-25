import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('lib/auth - getServerToken', () => {
  let getTokenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    getTokenMock = vi.fn();
  });

  it('returns token when next-auth getToken resolves', async () => {
    vi.doMock('next-auth/jwt', () => ({
      getToken: (...args: unknown[]) => getTokenMock(...(args as unknown[])),
    }));

    const { getServerToken } = await import('@/lib/auth');

    const fakeToken = { sub: 'user-123' };
    getTokenMock.mockResolvedValueOnce(fakeToken);

    const res = await getServerToken(new Request('http://localhost'));
    expect(res).toEqual(fakeToken);
  });

  it('returns null when next-auth getToken returns null', async () => {
    vi.doMock('next-auth/jwt', () => ({
      getToken: (...args: unknown[]) => getTokenMock(...(args as unknown[])),
    }));

    const { getServerToken } = await import('@/lib/auth');

    getTokenMock.mockResolvedValueOnce(null);

    const res = await getServerToken(new Request('http://localhost'));
    expect(res).toBeNull();
  });
});
