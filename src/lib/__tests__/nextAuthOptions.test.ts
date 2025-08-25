import { describe, expect, it } from 'vitest';
import { authOptions } from '@/lib/nextAuthOptions';

describe('nextAuthOptions callbacks', () => {
  it('jwt callback sets token.sub when user provided', async () => {
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
    } as unknown as JwtParams;

    const out = await jwtCallback(params);
    expect((out as JwtParams['token']).sub).toBe('USERID');
  });

  it('session callback sets session.user.id from token.sub', async () => {
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
    } as unknown as SessionParams;

    const out = await sessionCallback(params);
    expect(((out as SessionParams['session']).user as Record<string, unknown>).id).toBe('UID');
  });
});
