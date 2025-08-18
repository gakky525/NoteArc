'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">ページが見つかりません</h1>
        <p className="text-gray-600 mb-4">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
