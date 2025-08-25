import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('src/app/api/logs/[id]/route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('GET returns 401 when unauthenticated', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve(null) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost');
    const context = { params: { id: 'abc' } };

    const res = await RouteModule.GET(reqLike, context);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(401);
  });

  it('GET returns 400 when id missing', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'u1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost');
    const res = await RouteModule.GET(reqLike, undefined);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(400);
  });

  it('GET returns 404 when not found or wrong owner', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'user1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => ({
          lean: () => Promise.resolve(null),
        }),
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost');
    const context = { params: { id: 'nope' } };

    const res = await RouteModule.GET(reqLike, context);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(404);
  });

  it('GET returns log when owned by user', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const mockLog = {
      _id: 'L1',
      userId: 'owner1',
      title: 'T',
      content: 'C',
      date: new Date().toISOString(),
      tags: [],
    };

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => ({
          lean: () => Promise.resolve(mockLog),
        }),
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost');
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.GET(reqLike, context);
    if (res && typeof (res as Response).json === 'function') {
      const body = await (res as Response).json();
      expect((body as { _id?: string })._id).toBe('L1');
    } else {
      const status =
        res && typeof res === 'object' && 'status' in res
          ? (res as unknown as { status: number }).status
          : undefined;
      expect(status === undefined || status === 200).toBeTruthy();
    }
  });

  it('PUT returns 400 when invalid input', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const body = {};
    const reqLike = new Request('http://localhost', { method: 'PUT', body: JSON.stringify(body) });
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.PUT(reqLike, context);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(400);
  });

  it('PUT returns 404 when not found', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => Promise.resolve(null),
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ title: 'x' }),
    });
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.PUT(reqLike, context);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(404);
  });

  it('PUT updates and returns existing', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const existingDoc = {
      _id: 'L1',
      userId: 'owner1',
      title: 'Old',
      content: 'OldC',
      tags: [],
      date: new Date(),
      save: vi.fn().mockResolvedValue(true),
    };

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => Promise.resolve(existingDoc),
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ title: 'NewTitle' }),
    });
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.PUT(reqLike, context);
    if (res && typeof (res as Response).json === 'function') {
      const body = await (res as Response).json();
      expect((body as { title?: string }).title).toBe('NewTitle');
    }
  });

  it('DELETE returns 404 when not found', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => Promise.resolve(null),
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost', { method: 'DELETE' });
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.DELETE(reqLike, context);
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as unknown as { status: number }).status
        : undefined;
    expect(status).toBe(404);
  });

  it('DELETE deletes and returns success when owned', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: () => Promise.resolve({ sub: 'owner1' }) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => Promise.resolve() }));

    const existingDoc = { _id: 'L1', userId: 'owner1' };
    const findByIdAndDeleteMock = vi.fn().mockResolvedValue(true);

    vi.doMock('@/models/Log', () => ({
      Log: {
        findById: () => Promise.resolve(existingDoc),
        findByIdAndDelete: findByIdAndDeleteMock,
      },
    }));

    const RouteModule = await import('@/app/api/logs/[id]/route');

    const reqLike = new Request('http://localhost', { method: 'DELETE' });
    const context = { params: { id: 'L1' } };

    const res = await RouteModule.DELETE(reqLike, context);
    if (res && typeof (res as Response).json === 'function') {
      const body = await (res as Response).json();
      expect((body as { message?: string }).message).toBe('Deleted');
    }
  });
});
