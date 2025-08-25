import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.resetModules();

describe('src/app/api/logs/route', () => {
  let getServerTokenMock: (req: unknown) => Promise<{ sub?: string } | null>;
  let connectToDatabaseMock: () => Promise<unknown>;
  let findMock: () => Promise<unknown[]>;
  let saveMock: () => Promise<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();

    getServerTokenMock = vi.fn();
    connectToDatabaseMock = vi.fn();
    findMock = vi.fn();
    saveMock = vi.fn();
  });

  it('GET returns 401 when no token', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: (req: unknown) => getServerTokenMock(req) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => connectToDatabaseMock() }));
    vi.doMock('@/models/Log', () => ({
      Log: { find: () => ({ sort: () => ({ lean: () => findMock() }) }) },
    }));

    (getServerTokenMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const Route = await import('@/app/api/logs/route');
    const res = await Route.GET(new Request('http://localhost'));
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(401);
  });

  it('GET returns logs when token present', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: (req: unknown) => getServerTokenMock(req) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => connectToDatabaseMock() }));
    vi.doMock('@/models/Log', () => ({
      Log: {
        find: () => ({
          sort: () => ({ lean: () => findMock() }),
        }),
      },
    }));

    (getServerTokenMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'user1',
    });
    (findMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ title: 't' }]);

    const Route = await import('@/app/api/logs/route');
    const res = await Route.GET(new Request('http://localhost'));
    const body = await (res as Response).json().catch(() => null);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].title).toBe('t');
  });

  it('POST returns 401 when no token', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: (req: unknown) => getServerTokenMock(req) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => connectToDatabaseMock() }));
    vi.doMock('@/models/Log', () => ({ Log: vi.fn() }));

    (getServerTokenMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const Route = await import('@/app/api/logs/route');
    const payload = { title: 't', content: 'c' };
    const res = await Route.POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(401);
  });

  it('POST returns 400 on invalid input', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: (req: unknown) => getServerTokenMock(req) }));
    (getServerTokenMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u1',
    });

    const Route = await import('@/app/api/logs/route');
    const payload = { title: '', content: '' };
    const res = await Route.POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    expect(status).toBe(400);
  });

  it('POST saves log and returns 201 on success', async () => {
    vi.doMock('@/lib/auth', () => ({ getServerToken: (req: unknown) => getServerTokenMock(req) }));
    vi.doMock('@/lib/mongodb', () => ({ connectToDatabase: () => connectToDatabaseMock() }));

    class MockLog {
      title: string;
      content: string;
      date: Date;
      tags: string[];
      userId: string;
      constructor(input: {
        title: string;
        content: string;
        date: Date;
        tags: string[];
        userId: string;
      }) {
        this.title = input.title;
        this.content = input.content;
        this.date = input.date;
        this.tags = input.tags;
        this.userId = input.userId;
      }
      async save() {
        return saveMock();
      }
      toJSON() {
        return { title: this.title, content: this.content, userId: this.userId };
      }
    }

    vi.doMock('@/models/Log', () => ({ Log: MockLog }));

    (getServerTokenMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u1',
    });
    (connectToDatabaseMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    (saveMock as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    const Route = await import('@/app/api/logs/route');
    const payload = { title: 'Valid Title', content: 'Hello', tags: ['a'] };
    const res = await Route.POST(
      new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) })
    );
    const status =
      res && typeof res === 'object' && 'status' in res
        ? (res as { status: number }).status
        : undefined;
    const body = await (res as Response).json().catch(() => null);
    expect(status).toBe(201);
    expect(body.title).toBe('Valid Title');
  });
});
