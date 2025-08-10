'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [tags, setTags] = useState(log.tags.join(', '));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/logs/${log._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        tags: tags.split(',').map((t) => t.trim()),
      }),
    });

    if (res.ok) {
      router.push('/logs');
    } else {
      alert('更新に失敗しました');
    }
  };

  return (
    <main>
      <h1>ログ編集</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>タグ（カンマ区切り）</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='nextjs,mongodb'
          />
        </div>
        <button type='submit'>更新</button>
      </form>
    </main>
  );
}
