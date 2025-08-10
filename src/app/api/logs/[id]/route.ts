import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';

// 個別取得（GET）
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await connectToDatabase();
  const log = await Log.findById(id);
  return NextResponse.json(log);
}

// 更新（PUT）
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await connectToDatabase();
  const data = await req.json();
  const log = await Log.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(log);
}

// 削除（DELETE）
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await connectToDatabase();
  await Log.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Deleted' });
}
