// テスト API （MongoDB接続確認）

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await connectToDatabase();
    res.status(200).json({ message: 'Connected to MongoDB!' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to connect to MongoDB', details: error });
  }
}
