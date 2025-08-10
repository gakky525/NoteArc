import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';

// GET: 単一ログ取得
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const log = await Log.findById(params.id);
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(log);
}

// PUT: 更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const data = await req.json();
  const log = await Log.findByIdAndUpdate(params.id, data, { new: true });
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(log);
}

// DELETE: 削除
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  await Log.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted successfully' });
}
