'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LogModal, { LogType } from '@/components/LogModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<LogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // modal state
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/logs')
      .then(res => res.json())
      .then((data: LogType[]) => {
        if (!mounted) return;
        setLogs(data || []);
      })
      .catch(e => {
        console.error(e);
        setLogs([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (!openId) return;

    const found = logs.find(l => l._id === openId);
    if (found) {
      setSelectedLog(found);
      setModalOpen(true);
      return;
    }

    // ログリストにまだ無い場合は API から取得する
    (async () => {
      try {
        const res = await fetch(`/api/logs/${openId}`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched: LogType = {
          _id: data._id ?? data.id,
          title: data.title,
          content: data.content,
          date: data.date,
          tags: data.tags ?? [],
        };
        setSelectedLog(fetched);
        setModalOpen(true);
      } catch (err) {
        console.error('failed to fetch single log for open param', err);
      }
    })();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l => {
      if (l.title.toLowerCase().includes(q)) return true;
      if (l.tags && l.tags.some(t => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [logs, query]);

  const openLog = (log: LogType) => {
    // URL に反映してモーダルを開く
    router.replace(`/logs?open=${log._id}`);
    setSelectedLog(log);
    setModalOpen(true);
  };

  const doDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除失敗');
      setLogs(prev => prev.filter(l => l._id !== id));
      if (modalOpen) {
        setModalOpen(false);
        setSelectedLog(null);
        router.replace('/logs');
      }
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRequestDeleteFromModal = (id: string) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  // 認証されていない場合のガード
  useEffect(() => {
    if (status === 'loading') return;
    const isGuest =
      typeof window !== 'undefined' && localStorage.getItem('guest_access') === 'true';
    if (!session && !isGuest) {
      router.replace('/login');
    }
  }, [session, status, router]);

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedLog(null);
    router.replace('/logs');
  }

  return (
    <div>
      {session && (
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {session.user?.name ? `${session.user.name}さんの学習ログ` : '学習ログ'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-1 bg-red-600 text-white rounded-md"
            >
              Sign out
            </button>
          </div>
        </header>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex-1">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="タイトル・タグで検索"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/logs/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            新規作成
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">読み込み中…</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-white rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">該当する学習ログが見つかりません。</p>
          <Link href="/logs/new" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            新規作成
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map(log => (
            <li
              key={log._id}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 ${
                deletingId === log._id ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => openLog(log)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') openLog(log);
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{log.title}</h3>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.date).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {log.tags?.map(t => (
                  <span
                    key={t}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              {deletingId === log._id && <div className="mt-2 text-xs text-red-500">削除中…</div>}
            </li>
          ))}
        </ul>
      )}

      <LogModal
        log={selectedLog}
        open={modalOpen}
        onClose={handleCloseModal}
        onRequestDelete={handleRequestDeleteFromModal}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="ログを削除しますか？"
        message="この操作は取り消せません。よろしいですか？"
        onConfirm={async () => {
          if (confirmTargetId) {
            await doDelete(confirmTargetId);
            setConfirmTargetId(null);
            setConfirmOpen(false);
          }
        }}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
      />
    </div>
  );
}
