import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('mongoose');

describe('src/lib/mongodb', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('connectToDatabase calls mongoose.connect and caches result', async () => {
    const fakeConn = { connected: true };
    (mongoose.connect as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValueOnce(fakeConn);
    const mod = await import('@/lib/mongodb');
    const conn1 = await mod.connectToDatabase();
    const conn2 = await mod.connectToDatabase();
    expect(mongoose.connect).toHaveBeenCalled();
    expect(conn1).toBe(conn2);
  });

  it('dbDisconnect calls mongoose.disconnect and clears cache when connected', async () => {
    const fakeConn = { connected: true };
    (mongoose.connect as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValueOnce(fakeConn);
    (mongoose.disconnect as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValueOnce(undefined);
    const mod = await import('@/lib/mongodb');
    await mod.connectToDatabase();
    await mod.dbDisconnect();
    expect(mongoose.disconnect).toHaveBeenCalled();
  });
});
