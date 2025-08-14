'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function NewLogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('タイトルと内容は必須です');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error('作成に失敗');

      router.push('/logs');
    } catch (err) {
      console.error(err);
      alert('作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // レイアウトのためにクラスを切り替える
  const containerClass = showPreview
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
    : 'w-full';

  return (
    <main>
      <h1 className='text-2xl font-bold mb-4'>新規学習ログ作成</h1>

      <div className={containerClass}>
        {/* フォーム */}
        <form
          onSubmit={handleSubmit}
          className={`space-y-4 bg-white rounded-lg p-6 shadow ${
            showPreview ? '' : ''
          }`}
        >
          <div>
            <label className='block text-sm mb-1'>タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className='w-full rounded-md border px-3 py-2'
              placeholder='学習したことの概要'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>内容（Markdown可）</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className='w-full rounded-md border px-3 py-2'
              placeholder='学習内容や感想、参考リンクなど'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>タグ（カンマ区切り）</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className='w-full rounded-md border px-3 py-2'
              placeholder='nextjs, mongodb, typescript'
            />
          </div>

          <div className='flex items-center gap-3'>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50'
            >
              {loading ? '作成中…' : '作成'}
            </button>
            <button
              type='button'
              onClick={() => router.push('/logs')}
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
              <h3>{title}</h3>
              <ReactMarkdown>{content}</ReactMarkdown>
              <div className='mt-3'>
                {tags
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
    </main>
  );
}
