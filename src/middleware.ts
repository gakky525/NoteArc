import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // NextAuth の token を取得（App Router の NextRequest を直接渡せる）
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ルートにアクセス → ログイン済なら /logs にサーバー側で即リダイレクト
  if (pathname === '/' && token?.sub) {
    const url = req.nextUrl.clone();
    url.pathname = '/logs';
    return NextResponse.redirect(url);
  }

  // /logs 以下は認証が必要（未ログインなら /login にリダイレクト）
  if (pathname.startsWith('/logs')) {
    if (!token?.sub) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/logs/:path*'],
};
