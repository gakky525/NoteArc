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
    console.error('Failed to create log:', error);
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { id, ...updateFields } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedLog = await Log.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedLog) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Failed to update log:', error);
    return NextResponse.json(
      { error: 'Failed to update log' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deletedLog = await Log.findByIdAndDelete(id);

    if (!deletedLog) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Failed to delete log:', error);
    return NextResponse.json(
      { error: 'Failed to delete log' },
      { status: 500 }
    );
  }
}
