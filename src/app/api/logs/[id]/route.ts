import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';
import { z } from 'zod';
import { getServerToken } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  date: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getServerToken(_req);
  if (!token?.sub)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const log = await Log.findById(params.id).lean();
  if (!log || log.userId !== token.sub)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(log);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getServerToken(req);
  if (!token?.sub)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const existing = await Log.findById(params.id);
  if (!existing || existing.userId !== token.sub)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (parsed.data.title !== undefined) existing.title = parsed.data.title;
  if (parsed.data.content !== undefined) existing.content = parsed.data.content;
  if (parsed.data.tags !== undefined) existing.tags = parsed.data.tags;
  if (parsed.data.date !== undefined)
    existing.date = new Date(parsed.data.date);

  await existing.save();
  return NextResponse.json(existing);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getServerToken(_req);
  if (!token?.sub)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const existing = await Log.findById(params.id);
  if (!existing || existing.userId !== token.sub)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await Log.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted' });
}
