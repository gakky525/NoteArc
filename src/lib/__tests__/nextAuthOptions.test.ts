import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.resetModules();

describe('nextAuthOptions - authorize / callbacks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('authorize returns AuthUser when credentials valid', async () => {
    const mockFound = {
      _id: { toString: () => 'FOUND_ID' },
      name: 'Found Name',
      email: 'found@example.com',
      password: 'hashed_pw',
    };

    vi.doMock('next-auth/providers/credentials', () => ({
      default: (opts: unknown) => opts,
    }));

    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: async () => Promise.resolve(),
    }));

    vi.doMock('@/models/User', () => ({
      default: {
        findOne: () => ({
          lean: () => Promise.resolve(mockFound),
        }),
      },
    }));

    vi.doMock('bcryptjs', () => {
      const compare = async () => true;
      return { compare, default: { compare } };
    });

    const mod = await import('@/lib/nextAuthOptions');
    const authOptions = mod.authOptions;

    if (!authOptions.providers || authOptions.providers.length === 0) {
      throw new Error('No providers configured');
    }

    const provider = authOptions.providers[0] as unknown as {
      authorize?: (credentials?: Record<string, unknown>) => Promise<unknown | null | undefined>;
    };

    if (typeof provider.authorize !== 'function') {
      throw new Error('authorize missing');
    }

    const credentials = { email: 'found@example.com', password: 'secretpw' };
    const out = await provider.authorize(credentials);

    expect(out && typeof out === 'object' && (out as Record<string, unknown>).id).toBe('FOUND_ID');
  });

  it('authorize returns null when user not found or password mismatch', async () => {
    vi.doMock('next-auth/providers/credentials', () => ({
      default: (opts: unknown) => opts,
    }));

    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: async () => Promise.resolve(),
    }));

    vi.doMock('@/models/User', () => ({
      default: {
        findOne: () => ({
          lean: () => Promise.resolve(null),
        }),
      },
    }));

    vi.doMock('bcryptjs', () => {
      const compare = async () => false;
      return { compare, default: { compare } };
    });

    const mod = await import('@/lib/nextAuthOptions');
    const authOptions = mod.authOptions;

    if (!authOptions.providers || authOptions.providers.length === 0) {
      throw new Error('No providers configured');
    }

    const provider = authOptions.providers[0] as unknown as {
      authorize?: (credentials?: Record<string, unknown>) => Promise<unknown | null | undefined>;
    };

    if (typeof provider.authorize !== 'function') {
      throw new Error('authorize missing');
    }

    const res = await provider.authorize({ email: 'missing@example.com', password: 'pw' });
    expect(res).toBeNull();
  });

  it('jwt callback sets token.sub when user provided', async () => {
    const { authOptions } = await import('@/lib/nextAuthOptions');
    const jwtCallback = authOptions.callbacks?.jwt;
    const user = { id: 'USERID', name: 'N', email: 'e' };
    const token = {};
    if (typeof jwtCallback !== 'function') throw new Error('jwt callback missing');

    type JwtParams = Parameters<NonNullable<typeof jwtCallback>>[0];

    const params = {
      token: token as JwtParams['token'],
      user: user as JwtParams['user'],
      account: null as JwtParams['account'],
      profile: undefined as unknown as JwtParams['profile'],
      trigger: undefined as unknown as JwtParams['trigger'],
      session: undefined as unknown as JwtParams['session'],
    } as JwtParams;

    const out = await jwtCallback(params);
    expect((out as JwtParams['token']).sub).toBe('USERID');
  });

  it('session callback sets session.user.id from token.sub', async () => {
    const { authOptions } = await import('@/lib/nextAuthOptions');
    const sessionCallback = authOptions.callbacks?.session;
    const session = { user: { name: 'N', email: 'e' } };
    const token = { sub: 'UID' };
    if (typeof sessionCallback !== 'function') throw new Error('session callback missing');

    type SessionParams = Parameters<NonNullable<typeof sessionCallback>>[0];

    const params = {
      session: session as SessionParams['session'],
      token: token as SessionParams['token'],
      user: {} as SessionParams['user'],
      newSession: undefined as unknown as SessionParams['newSession'],
      trigger: undefined as unknown as SessionParams['trigger'],
    } as SessionParams;

    const out = await sessionCallback(params);
    expect(((out as SessionParams['session']).user as Record<string, unknown>).id).toBe('UID');
  });
});
