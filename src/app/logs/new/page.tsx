'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createGuestDraft } from '@/lib/guestStorage';

export default function NewLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session;
  const isSessionLoading = status === 'loading';
  const clientGuestFlag =
    typeof window !== 'undefined' && localStorage.getItem('guest_access') === 'true';
  const isGuestViewing = !isAuthenticated && clientGuestFlag;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSessionLoading) return;
    setLoading(true);

    const tags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      if (isAuthenticated) {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            alert('セッション切れの可能性があります。再ログインしてください。');
            router.push('/login');
            return;
          }
          const errText = await res.text().catch(() => null);
          throw new Error(errText || '作成に失敗しました');
        }
        router.push('/logs');
      } else if (isGuestViewing) {
        // ゲストの場合はローカルに保存
        try {
          localStorage.setItem('guest_access', 'true');
        } catch (e) {
          console.warn('failed to set guest_access', e);
        }

        createGuestDraft({ title: title || 'Untitled', content, tags });
        router.push('/logs');
      } else {
        // 未ログイン(next-auth のセッションがない)かつ未ゲスト(guest_access キーが存在しない)の場合：自動的にゲスト保存してログ一覧へ
        try {
          localStorage.setItem('guest_access', 'true');
        } catch (e) {
          console.warn('failed to set guest_access', e);
        }
        createGuestDraft({ title: title || 'Untitled', content, tags });
        router.push('/logs');
      }
    } catch (err) {
      console.error('create log error', err);
      alert((err as Error)?.message || '作成に失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">新規作成</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow">
        <div>
          <label className="block text-sm mb-1">タイトル</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="タイトルを入力"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">内容（Markdown対応）</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="本文..."
          />
        </div>

        <div>
          <label className="block text-sm mb-1">タグ（カンマ区切り）</label>
          <input
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="nextjs, mongodb"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || isSessionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? '作成中…' : '作成'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/logs')}
            className="px-4 py-2 border rounded-md"
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  );
}
