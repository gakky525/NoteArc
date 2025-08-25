import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';
import type { AnyBulkWriteOperation, Collection } from 'mongodb';

const DraftSchema = z.object({
  tempId: z.string(),
  title: z.string().max(300).optional(),
  content: z.string().max(20000).optional(),
  tags: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

const BodySchema = z.object({
  drafts: z.array(DraftSchema).max(50),
});

type BulkDoc = {
  title: string;
  content: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  guestTempId: string;
};

function isRequestLike(obj: unknown): obj is { json: () => Promise<unknown> } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'json' in obj &&
    typeof (obj as { json?: unknown }).json === 'function'
  );
}

function extractUserIdFromSession(s: unknown): string | null {
  if (s == null || typeof s !== 'object') return null;
  const obj = s as Record<string, unknown>;

  if ('user' in obj && obj.user && typeof obj.user === 'object') {
    const user = obj.user as Record<string, unknown>;
    const uId = user.id ?? user._id ?? user.userId ?? user.sub;
    if (typeof uId === 'string') return uId;
    if (typeof uId === 'number') return String(uId);
  }

  const topId = obj.id ?? obj._id ?? obj.sub;
  if (typeof topId === 'string') return topId;
  if (typeof topId === 'number') return String(topId);

  return null;
}

export async function POST(req: Request) {
  try {
    let rawSession: unknown = null;
    try {
      rawSession = await getServerSession(authOptions);
    } catch (e) {
      console.error('getServerSession threw:', e);
      rawSession = null;
    }

    const userId = extractUserIdFromSession(rawSession);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawBody: unknown = null;
    if (isRequestLike(req)) {
      rawBody = await req.json().catch(() => null);
    } else {
      rawBody = null;
    }

    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const drafts = parsed.data.drafts;
    if (!Array.isArray(drafts) || drafts.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    await connectToDatabase();

    const ops: AnyBulkWriteOperation<BulkDoc>[] = drafts.map(d => {
      const doc: BulkDoc = {
        title: d.title ?? 'Untitled',
        content: d.content ?? '',
        tags: d.tags ?? [],
        userId,
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
        guestTempId: d.tempId,
      };

      return {
        updateOne: {
          filter: { userId: doc.userId, guestTempId: doc.guestTempId },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      } as AnyBulkWriteOperation<BulkDoc>;
    });

    if (ops.length > 0) {
      const logModelLike = Log as unknown as { collection?: Partial<Collection<BulkDoc>> };
      const collection = logModelLike.collection;
      if (!collection || typeof collection.bulkWrite !== 'function') {
        console.warn('Log.collection.bulkWrite not available; skipping bulkWrite');
        return NextResponse.json({ ok: true, inserted: 0 });
      }
      await collection.bulkWrite(ops);
    }

    return NextResponse.json({ ok: true, inserted: ops.length });
  } catch (err) {
    console.error('guest merge error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
