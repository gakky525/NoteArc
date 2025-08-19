import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'NoteArc',
  description: 'メモ帳感覚で使える学習ログアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-800">
        <Providers>
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
