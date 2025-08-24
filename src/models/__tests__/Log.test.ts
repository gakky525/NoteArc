import { beforeAll, afterAll, describe, it, expect } from 'vitest';
// import mongoose from 'mongoose';
import { setupMongoMemoryServer, teardownMongoMemoryServer } from '@/test/setupMongo';
import { Log } from '@/models/Log';

describe('Log model', () => {
  beforeAll(async () => {
    await setupMongoMemoryServer();
  });

  afterAll(async () => {
    await teardownMongoMemoryServer();
  });

  it('creates and finds a log', async () => {
    const doc = new Log({
      title: 'テストログ',
      content: '内容',
      userId: 'user-123',
      tags: ['nextjs', 'mongodb'],
    });
    await doc.save();

    const found = await Log.findOne({ userId: 'user-123' }).lean();
    expect(found).not.toBeNull();
    expect(found!.title).toBe('テストログ');
    expect(found!.tags).toContain('nextjs');
  });
});
