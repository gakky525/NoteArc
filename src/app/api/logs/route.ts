import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';

// GET: 全ログ取得
export async function GET() {
  await connectToDatabase();
  const logs = await Log.find().sort({ date: -1 });
  return NextResponse.json(logs);
}

// POST: 新規作成
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const log = new Log(data);
    await log.save();
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}
