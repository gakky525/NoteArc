'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createGuestDraft } from '@/lib/guestStorage';

export default function NewLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [format, setFormat] = useState<'plain' | 'markdown'>('plain'); // 新規のデフォルトはテキスト
  const [loading, setLoading] = useState(false);

  // プレビュー表示状態（Markdown を選択している時のみ利用可能）
  const [showPreview, setShowPreview] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session;
  const isSessionLoading = status === 'loading';

  // フォーマットが plain に変わったらプレビューを自動的に閉じる
  useEffect(() => {
    if (format !== 'markdown' && showPreview) {
      setShowPreview(false);
    }
  }, [format, showPreview]);

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    [tagsText]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSessionLoading) return;
    setLoading(true);

    try {
      if (isAuthenticated) {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags, format }),
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
      } else {
        try {
          localStorage.setItem('guest_access', 'true');
        } catch (e) {
          console.warn('failed to set guest_access', e);
        }
        createGuestDraft({ title: title || 'Untitled', content, tags, format });
        router.push('/logs');
      }
    } catch (err) {
      console.error('create log error', err);
      alert((err as Error)?.message || '作成に失敗');
    } finally {
      setLoading(false);
    }
  }

  // レイアウト用のクラス（プレビュー時は2カラム風）
  const containerClass = showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'w-full';

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

        <div className={containerClass}>
          <div>
            <div>
              <label className="block text-sm mb-1">記法</label>
              <div className="flex gap-3 items-center mb-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="plain"
                    checked={format === 'plain'}
                    onChange={() => setFormat('plain')}
                  />
                  <span>テキスト</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="markdown"
                    checked={format === 'markdown'}
                    onChange={() => setFormat('markdown')}
                  />
                  <span>Markdown</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">内容</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                required
                className="w-full rounded-md border px-3 py-2"
                placeholder="本文..."
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm mb-1">タグ（カンマ区切り）</label>
              <input
                value={tagsText}
                onChange={e => setTagsText(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="タグ１, タグ２..."
              />
            </div>

            <div className="mt-4 flex gap-3 items-center">
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

              {/* プレビューボタン（Markdown 選択時のみ表示） */}
              {format === 'markdown' && (
                <button
                  type="button"
                  onClick={() => setShowPreview(s => !s)}
                  className="px-4 py-2 border rounded-md"
                >
                  {showPreview ? 'プレビューを閉じる' : 'プレビューを表示'}
                </button>
              )}
            </div>
          </div>

          {/* プレビュー画面（format === 'markdown' かつ showPreview が true のときだけ表示） */}
          {showPreview && format === 'markdown' && (
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">プレビュー</h2>
                <span className="text-sm text-gray-500">Markdown 表示</span>
              </div>

              <article className="prose article-prose max-w-none">
                <h3>{title || '（タイトル）'}</h3>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || '（Markdown本文）'}
                </ReactMarkdown>
                <div className="mt-3">
                  {tags.map(t => (
                    <span key={t} className="text-xs bg-gray-100 px-2 py-1 mr-2 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
