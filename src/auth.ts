import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function findUserByEmail(email: string) {
  await connectToDatabase();
  return User.findOne({ email }).lean();
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  await connectToDatabase();
  const hashed = await bcrypt.hash(password, 10);
  const doc = new User({ email, password: hashed, name });
  await doc.save();
  return doc.toObject();
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
