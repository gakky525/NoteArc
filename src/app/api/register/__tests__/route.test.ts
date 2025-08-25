import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.resetModules();

describe('src/app/api/register/route', () => {
  let findUserByEmailMock: (email: string) => Promise<unknown | null>;
  let createUserMock: (email: string, password: string, name?: string) => Promise<void>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    findUserByEmailMock = vi.fn();
    createUserMock = vi.fn();
  });

  it('POST returns 400 when missing fields', async () => {
    vi.doMock('@/auth', () => ({
      findUserByEmail: (e: string) => findUserByEmailMock(e),
      createUser: (e: string, p: string, n?: string) => createUserMock(e, p, n),
    }));
    const Route = await import('@/app/api/register/route');
    const res = await Route.POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(400);
  });

  it('POST returns 409 when user exists', async () => {
    vi.doMock('@/auth', () => ({
      findUserByEmail: (email: string) => findUserByEmailMock(email),
      createUser: (e: string, p: string, n?: string) => createUserMock(e, p, n),
    }));
    (findUserByEmailMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      email: 'x',
    });
    const Route = await import('@/app/api/register/route');
    const res = await Route.POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@x', password: 'pass' }),
      })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(409);
  });

  it('POST returns 201 when created', async () => {
    vi.doMock('@/auth', () => ({
      findUserByEmail: (email: string) => findUserByEmailMock(email),
      createUser: (e: string, p: string, n?: string) => createUserMock(e, p, n),
    }));
    (findUserByEmailMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    (createUserMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const Route = await import('@/app/api/register/route');
    const res = await Route.POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@x', password: 'pass', name: 'n' }),
      })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(201);
  });

  it('POST returns 500 on exception', async () => {
    vi.doMock('@/auth', () => ({
      findUserByEmail: (email: string) => findUserByEmailMock(email),
      createUser: (e: string, p: string, n?: string) => createUserMock(e, p, n),
    }));
    (findUserByEmailMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    (createUserMock as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('fail')
    );
    const Route = await import('@/app/api/register/route');
    const res = await Route.POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@x', password: 'pass', name: 'n' }),
      })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(500);
  });
});
