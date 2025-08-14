import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function getServerToken(req: Request) {
  return await getToken({
    req: req as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });
}
