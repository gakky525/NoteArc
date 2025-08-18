'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Props = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Unhandled error in app:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">エラーが発生しました</h1>
        <p className="text-gray-600 mb-4">
          問題が発生しました。ページを再読み込みするか、後ほどお試しください。
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            再試行
          </button>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
