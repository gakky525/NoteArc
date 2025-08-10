'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Log = {
  _id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data: Log[]) => setLogs(data));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });

    if (res.ok) {
      setLogs((prev) => prev.filter((log) => log._id !== id));
    } else {
      alert('削除に失敗しました');
    }
  };

  return (
    <main>
      <h1>学習ログ一覧</h1>
      <Link href='/logs/new'>新規作成</Link>

      {logs.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log._id}>
              <h2>{log.title}</h2>
              <p>{log.content}</p>
              <small>
                {new Date(log.date).toLocaleString()} | {log.tags.join(', ')}
              </small>
              <div>
                <Link href={`/logs/edit/${log._id}`}>編集</Link>
                <button onClick={() => handleDelete(log._id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
