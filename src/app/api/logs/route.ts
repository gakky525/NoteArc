import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';
import { z } from 'zod';
import { getServerToken } from '@/lib/auth';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  date: z.string().optional(),
});

export async function GET(req: Request) {
  const token = await getServerToken(req);
  if (!token?.sub)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const logs = await Log.find({ userId: token.sub }).sort({ date: -1 }).lean();
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const token = await getServerToken(req);
  if (!token?.sub)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const log = new Log({
    title: parsed.data.title,
    content: parsed.data.content,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    tags: parsed.data.tags || [],
    userId: token.sub,
  });

  await log.save();
  return NextResponse.json(log, { status: 201 });
}
