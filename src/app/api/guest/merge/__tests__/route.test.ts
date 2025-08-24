// src/app/api/guest/merge/__tests__/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('POST /api/guest/merge', () => {
  let getServerSessionMock: ReturnType<typeof vi.fn>;
  let connectToDatabaseMock: ReturnType<typeof vi.fn>;
  let bulkWriteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();

    getServerSessionMock = vi.fn();
    connectToDatabaseMock = vi.fn();
    bulkWriteMock = vi.fn();
  });

  function getStatus(res: unknown): number | undefined {
    if (typeof res === 'object' && res !== null) {
      const maybe = res as { status?: unknown };
      if (typeof maybe.status === 'number') return maybe.status;
    }
    return undefined;
  }

  it('returns 401 when not authenticated', async () => {
    // prepare mocks BEFORE importing the route module
    vi.doMock('next-auth', () => ({
      getServerSession: (...args: unknown[]) => getServerSessionMock(...(args as unknown[])),
    }));
    vi.doMock('next-auth/next', () => ({
      getServerSession: (...args: unknown[]) => getServerSessionMock(...(args as unknown[])),
    }));
    vi.doMock('@/lib/nextAuthOptions', () => ({ authOptions: {} }));
    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: (...args: unknown[]) => connectToDatabaseMock(...(args as unknown[])),
    }));
    vi.doMock('@/models/Log', () => ({
      Log: {
        collection: {
          bulkWrite: (...args: unknown[]) => bulkWriteMock(...(args as unknown[])),
        },
      },
    }));

    getServerSessionMock.mockResolvedValueOnce(null);

    const RouteModule = await import('@/app/api/guest/merge/route');

    const reqLike = { json: async () => ({ drafts: [] }) } as unknown as Request;

    const res = await RouteModule.POST(reqLike);
    const status = getStatus(res);
    expect(status).toBe(401);
  });

  it('accepts drafts and calls bulkWrite when authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: (...args: unknown[]) => getServerSessionMock(...(args as unknown[])),
    }));
    vi.doMock('next-auth/next', () => ({
      getServerSession: (...args: unknown[]) => getServerSessionMock(...(args as unknown[])),
    }));
    vi.doMock('@/lib/nextAuthOptions', () => ({ authOptions: {} }));
    vi.doMock('@/lib/mongodb', () => ({
      connectToDatabase: (...args: unknown[]) => connectToDatabaseMock(...(args as unknown[])),
    }));
    vi.doMock('@/models/Log', () => ({
      Log: {
        collection: {
          bulkWrite: (...args: unknown[]) => bulkWriteMock(...(args as unknown[])),
        },
      },
    }));

    getServerSessionMock.mockResolvedValueOnce({ user: { id: 'user1' } });
    connectToDatabaseMock.mockResolvedValueOnce(undefined);
    bulkWriteMock.mockResolvedValueOnce({});

    const RouteModule = await import('@/app/api/guest/merge/route');

    const payload = {
      drafts: [
        {
          tempId: 't1',
          title: 'T1',
          content: 'C1',
          tags: ['a'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const reqLike = { json: async () => payload } as unknown as Request;

    const res = await RouteModule.POST(reqLike);
    const status = getStatus(res);
    expect(status).toBe(200);
    expect(bulkWriteMock).toHaveBeenCalled();
  });
});
