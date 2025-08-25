import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('lib/authUser', () => {
  let connectToDatabaseMock: ReturnType<typeof vi.fn>;
  let hashMock: ReturnType<typeof vi.fn>;
  let compareMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    connectToDatabaseMock = vi.fn();
    hashMock = vi.fn();
    compareMock = vi.fn();
  });

  it('findUserByEmail calls DB and returns lean result', async () => {
    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: (..._args: unknown[]) => connectToDatabaseMock(...(_args as unknown[])),
    }));

    class MockUser {
      email?: string;
      name?: string;
      constructor(data?: Partial<{ email: string; name: string }>) {
        if (data) Object.assign(this, data);
      }
      save(): Promise<MockUser> {
        return Promise.resolve(this);
      }
      toObject(): { email?: string; name?: string } {
        return { email: this.email, name: this.name };
      }
      static findOne(query: { email: string }) {
        return {
          lean: () => Promise.resolve({ email: query.email, name: 'Mocked' }),
        };
      }
    }

    vi.doMock('@/models/User', () => ({
      default: MockUser,
    }));

    const { findUserByEmail } = await import('@/lib/authUser');

    const res = await findUserByEmail('a@x.com');
    expect(res).toEqual({ email: 'a@x.com', name: 'Mocked' });
  });

  it('createUser hashes password, saves and returns toObject', async () => {
    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: (..._args: unknown[]) => connectToDatabaseMock(...(_args as unknown[])),
    }));

    vi.doMock('bcryptjs', () => ({
      default: {
        hash: (..._args: unknown[]) => hashMock(...(_args as unknown[])),
        compare: (..._args: unknown[]) => compareMock(...(_args as unknown[])),
      },
    }));

    let lastConstructed: Record<string, unknown> | null = null;
    class MockUserForCreate {
      email?: string;
      password?: string;
      name?: string;
      constructor(data?: Partial<{ email: string; password: string; name: string }>) {
        if (data) Object.assign(this, data);
        lastConstructed = data ? { ...(data as Record<string, unknown>) } : null;
      }
      save(): Promise<void> {
        return Promise.resolve();
      }
      toObject(): { email?: string; name?: string } {
        return {
          email: this.email,
          name: this.name,
        };
      }
    }

    vi.doMock('@/models/User', () => ({
      default: MockUserForCreate,
    }));

    hashMock.mockResolvedValueOnce('hashed-pw');

    const { createUser } = await import('@/lib/authUser');

    const out = await createUser('bob@example.com', 'pw12345', 'Bob');
    expect(out).toEqual({ email: 'bob@example.com', name: 'Bob' });
    expect(hashMock).toHaveBeenCalled();

    if (lastConstructed === null) {
      throw new Error('Expected lastConstructed to be set by constructor');
    }
    expect(String(lastConstructed['password'])).toBe('hashed-pw');
  });

  it('verifyPassword delegates to bcrypt.compare', async () => {
    vi.doMock('bcryptjs', () => ({
      default: {
        hash: (..._args: unknown[]) => hashMock(...(_args as unknown[])),
        compare: (..._args: unknown[]) => compareMock(...(_args as unknown[])),
      },
    }));

    compareMock.mockResolvedValueOnce(true);

    const { verifyPassword } = await import('@/lib/authUser');

    const ok = await verifyPassword('plain', 'hashed');
    expect(ok).toBe(true);
    expect(compareMock).toHaveBeenCalledWith('plain', 'hashed');
  });
});
