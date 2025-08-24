import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ログインユーザーをルートから /logs にリダイレクト
  if (pathname === '/' && token?.sub) {
    const url = req.nextUrl.clone();
    url.pathname = '/logs';
    return NextResponse.redirect(url);
  }

  const allowGuestPaths = ['/logs', '/logs/', '/logs/new', '/logs/new/'];

  if (allowGuestPaths.includes(pathname) || pathname.startsWith('/logs/guest')) {
    return NextResponse.next();
  }

  // その他の /logs/* パスには認証が必要
  if (pathname.startsWith('/logs')) {
    if (!token?.sub) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/logs/:path*'],
};
