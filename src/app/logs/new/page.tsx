'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== ''),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create log');
      }

      // 作成後に /logs に移動
      router.push('/logs');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('作成に失敗しました');
    }
  };

  return (
    <main>
      <h1>新規学習ログ作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>タイトル</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>内容</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label>タグ（カンマ区切り）</label>
          <br />
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <button type='submit'>作成</button>
      </form>
    </main>
  );
}
