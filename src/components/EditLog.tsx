'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ConfirmDialog from './ConfirmDialog';

type Log = {
  _id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
};

export default function EditLog({ log }: { log: Log }) {
  const router = useRouter();
  const [title, setTitle] = useState(log.title);
  const [content, setContent] = useState(log.content);
  const [tagsText, setTagsText] = useState((log.tags || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error('更新失敗');

      // 更新後は一覧に戻す
      router.push('/logs');
    } catch (err) {
      console.error(err);
      alert('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function doDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${log._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除失敗');
      router.push('/logs');
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push(`/logs?open=${log._id}`);
  }

  // レイアウト切替クラス
  const containerClass = showPreview
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
    : 'w-full';

  return (
    <main>
      <h1 className='text-2xl font-bold mb-4'>ログ編集</h1>

      <div className={containerClass}>
        {/* フォーム */}
        <form
          onSubmit={handleSubmit}
          className='space-y-4 bg-white rounded-lg p-6 shadow'
        >
          <div>
            <label className='block text-sm mb-1'>タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className='w-full rounded-md border px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>内容（Markdown対応）</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className='w-full rounded-md border px-3 py-2'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>タグ（カンマ区切り）</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className='w-full rounded-md border px-3 py-2'
              placeholder='nextjs, mongodb'
            />
          </div>

          <div className='flex gap-3'>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50'
            >
              {loading ? '更新中…' : '更新'}
            </button>

            <button
              type='button'
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className='px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50'
            >
              削除
            </button>

            <button
              type='button'
              onClick={handleCancel}
              className='px-4 py-2 border rounded-md'
            >
              キャンセル
            </button>

            <button
              type='button'
              onClick={() => setShowPreview((s) => !s)}
              className='px-3 py-1 border rounded-md'
            >
              {showPreview ? 'プレビューを隠す' : 'プレビューを表示'}
            </button>
          </div>
        </form>

        {/* プレビュー */}
        {showPreview && (
          <div className='bg-white rounded-lg p-6 shadow'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-semibold'>プレビュー</h2>
              <span className='text-sm text-gray-500'>Markdown 表示</span>
            </div>

            <article className='prose max-w-none'>
              <h3>{title || 'タイトルのプレビュー'}</h3>
              <ReactMarkdown>
                {content || '内容のプレビュー（Markdown対応）'}
              </ReactMarkdown>
              <div className='mt-3'>
                {tagsText
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <span
                      key={t}
                      className='text-xs bg-gray-100 px-2 py-1 mr-2 rounded'
                    >
                      #{t}
                    </span>
                  ))}
              </div>
            </article>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title='ログを削除しますか？'
        message='この操作は取り消せません。よろしいですか？'
        onConfirm={() => {
          setConfirmOpen(false);
          doDelete();
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </main>
  );
}
