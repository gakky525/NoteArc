import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.resetModules();

describe('src/app/api/register/route', () => {
  let findUserByEmailMock: ReturnType<typeof vi.fn>;
  let createUserMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    findUserByEmailMock = vi.fn();
    createUserMock = vi.fn();
  });

  it('POST returns 400 when missing fields', async () => {
    vi.doMock('@/lib/authUser', () => ({
      findUserByEmail: (...args: unknown[]) => findUserByEmailMock(...(args as unknown[])),
      createUser: (...args: unknown[]) => createUserMock(...(args as unknown[])),
    }));

    const Route = await import('@/app/api/register/route');

    const reqLike = {
      json: async () => ({}),
    } as unknown as Request;

    const res = await Route.POST(reqLike);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(400);
  });

  it('POST returns 409 when user exists', async () => {
    findUserByEmailMock.mockResolvedValueOnce({ email: 'x' });

    vi.doMock('@/lib/authUser', () => ({
      findUserByEmail: (...args: unknown[]) => findUserByEmailMock(...(args as unknown[])),
      createUser: (...args: unknown[]) => createUserMock(...(args as unknown[])),
    }));

    const Route = await import('@/app/api/register/route');

    const reqLike = {
      json: async () => ({ email: 'a@x', password: 'pass' }),
    } as unknown as Request;

    const res = await Route.POST(reqLike);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(409);
  });

  it('POST returns 201 when created', async () => {
    findUserByEmailMock.mockResolvedValueOnce(null);
    createUserMock.mockResolvedValueOnce({ email: 'new@example.com', name: 'New' });

    vi.doMock('@/lib/authUser', () => ({
      findUserByEmail: (...args: unknown[]) => findUserByEmailMock(...(args as unknown[])),
      createUser: (...args: unknown[]) => createUserMock(...(args as unknown[])),
    }));

    const Route = await import('@/app/api/register/route');

    const reqLike = {
      json: async () => ({ email: 'new@example.com', password: 'pw123', name: 'New' }),
    } as unknown as Request;

    const res = await Route.POST(reqLike);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;

    expect(status).toBe(201);
    expect(createUserMock).toHaveBeenCalledWith('new@example.com', 'pw123', 'New');
  });

  it('POST returns 500 on exception', async () => {
    findUserByEmailMock.mockImplementationOnce(() => {
      throw new Error('fail');
    });

    vi.doMock('@/lib/authUser', () => ({
      findUserByEmail: (...args: unknown[]) => findUserByEmailMock(...(args as unknown[])),
      createUser: (...args: unknown[]) => createUserMock(...(args as unknown[])),
    }));

    const Route = await import('@/app/api/register/route');

    const reqLike = {
      json: async () => ({ email: 'a@x', password: 'pass', name: 'n' }),
    } as unknown as Request;

    const res = await Route.POST(reqLike);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(500);
  });
});
