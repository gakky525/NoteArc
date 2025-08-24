'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { buildMergePayload, clearGuestDrafts, hasGuestDrafts } from '@/lib/guestStorage';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(50).optional(),
});

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function tryMergeGuestDrafts() {
    try {
      if (!hasGuestDrafts()) return;
      const payload = buildMergePayload();
      const res = await fetch('/api/guest/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        clearGuestDrafts();
      } else {
        console.warn('guest merge failed', await res.text());
      }
    } catch (e) {
      console.warn('guest merge error', e);
    }
  }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] || '入力を確認してください'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || '登録に失敗しました');
        setLoading(false);
        return;
      }

      // 登録後に自動ログイン（credentials）
      const sign = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      setLoading(false);
      if (sign?.ok) {
        // サインイン成功したらゲスト下書きをサーバへマージ
        await tryMergeGuestDrafts();
        router.push('/logs');
      } else {
        // 何らかの理由で sign-in 失敗時はログインページへ誘導
        router.push('/login');
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError('通信エラーが発生しました');
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">NoteArc</h1>
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-center mb-4">アカウント作成</h2>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">ニックネーム</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">メールアドレス</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">パスワード</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="8文字以上"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 cursor-pointer"
          >
            {loading ? '登録中...' : 'アカウント作成'}
          </button>

          <p className="text-sm text-center text-gray-500 mt-3">
            すでにアカウントをお持ちですか？{' '}
            <a href="/login" className="text-blue-600">
              ログイン
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
