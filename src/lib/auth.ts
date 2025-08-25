// サーバ側でリクエストから NextAuth の JWT（token）を取り出す　→　API が「今のリクエストのユーザー」を判定
import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';

export type MaybeNextRequest = Request | NextRequest;

export async function getServerToken(req: MaybeNextRequest): Promise<JWT | null> {
  return await getToken({
    req: req as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });
}
