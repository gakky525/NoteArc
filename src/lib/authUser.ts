// ユーザーの永続化（DB）操作・パスワードハッシュ/検証　→　ユーザー作成や登録APIに関与

import bcrypt from 'bcryptjs';
import User, { IUser } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

// メールでユーザーを検索して lean オブジェクトを返す
export async function findUserByEmail(email: string): Promise<Partial<IUser> | null> {
  await connectToDatabase();
  return await User.findOne({ email }).lean();
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<Partial<IUser>> {
  await connectToDatabase();
  const hashed = await bcrypt.hash(password, 10);
  const doc = new User({ email, password: hashed, name });
  await doc.save();
  return doc.toObject();
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
