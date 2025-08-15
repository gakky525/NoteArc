'use client';
import React from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      setLoading(false);
      if (res?.ok) router.push('/logs');
      else setError('メールアドレスまたはパスワードが正しくありません');
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError('通信エラーが発生しました');
    }
  }

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-bold mb-6'>メモ帳感覚で使える学習ログ</h1>
      <div className='w-full max-w-md bg-white rounded-2xl shadow p-8'>
        <h2 className='text-2xl font-bold text-center mb-4'>ログイン</h2>

        <form onSubmit={handle} className='space-y-4'>
          <div>
            <label className='block text-sm mb-1'>メールアドレス</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
              placeholder='you@example.com'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>パスワード</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500'
              placeholder='••••••••'
            />
          </div>

          {error && <p className='text-sm text-red-600'>{error}</p>}

          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50'
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className='text-sm text-center text-gray-500'>
            アカウントを作成していませんか？{' '}
            <Link href='/register' className='text-blue-600'>
              登録する
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
