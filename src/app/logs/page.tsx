'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LogModal, { type LogType } from '@/components/LogModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getGuestDrafts, removeGuestDraft } from '@/lib/guestStorage';

type ServerLogShape = {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
};

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<LogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const clientGuestFlag =
    typeof window !== 'undefined' && localStorage.getItem('guest_access') === 'true';
  const isAuthenticated = status === 'authenticated' && !!session;
  const isGuestViewing = !isAuthenticated && clientGuestFlag;

  function normalizeServerLog(item: ServerLogShape): LogType {
    const id = item._id ?? item.id ?? '';
    return {
      _id: id,
      title: item.title,
      content: item.content,
      date: item.date ?? new Date().toISOString(),
      tags: item.tags ?? [],
    };
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadFromServer() {
      try {
        const res = await fetch('/api/logs');
        if (!mounted) return;
        if (res.status === 401) {
          loadFromGuest();
          return;
        }
        if (!res.ok) {
          console.warn('failed to fetch logs:', res.status);
          loadFromGuest();
          return;
        }
        const data = (await res.json()) as ServerLogShape[] | { error?: string };
        if (!Array.isArray(data)) {
          loadFromGuest();
          return;
        }
        const mapped = data.map(normalizeServerLog);
        setLogs(mapped);
      } catch (err) {
        console.error('fetch logs error', err);
        loadFromGuest();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    function loadFromGuest() {
      try {
        const drafts = getGuestDrafts();
        const mapped: LogType[] = drafts.map(d => ({
          _id: d.tempId,
          title: d.title ?? 'Untitled',
          content: d.content ?? '',
          date: d.updatedAt ?? d.createdAt ?? new Date().toISOString(),
          tags: d.tags ?? [],
          _isGuest: true,
        }));
        setLogs(mapped);
      } catch (e) {
        console.warn('failed to load guest drafts', e);
        setLogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadFromServer();
    } else if (isGuestViewing) {
      loadFromGuest();
    } else {
      loadFromServer();
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, clientGuestFlag]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l => {
      if (l.title.toLowerCase().includes(q)) return true;
      if (l.tags && l.tags.some(t => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [logs, query]);

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

    if (isGuestViewing) {
      const drafts = getGuestDrafts();
      const g = drafts.find(d => d.tempId === openId);
      if (g) {
        setSelectedLog({
          _id: g.tempId,
          title: g.title ?? 'Untitled',
          content: g.content ?? '',
          date: g.updatedAt ?? g.createdAt ?? new Date().toISOString(),
          tags: g.tags ?? [],
          _isGuest: true,
        });
        setModalOpen(true);
        return;
      }
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/logs/${openId}`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched: LogType = {
          _id: data._id ?? data.id,
          title: data.title,
          content: data.content,
          date: data.date ?? new Date().toISOString(),
          tags: data.tags ?? [],
        };
        setSelectedLog(fetched);
        setModalOpen(true);
      } catch (err) {
        console.error('failed to fetch single log', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, status, clientGuestFlag]);

  const openLog = (log: LogType) => {
    // URL に反映してモーダルを開く
    router.replace(`/logs?open=${log._id}`);
    setSelectedLog(log);
    setModalOpen(true);
  };

  const doDelete = async (id: string) => {
    setDeletingId(id);

    const found = logs.find(l => l._id === id);
    const isGuestDraft = found?._isGuest === true;

    try {
      if (isGuestDraft && !isAuthenticated) {
        try {
          removeGuestDraft(id);
        } catch (e) {
          console.warn('removeGuestDraft failed', e);
        }
        setLogs(prev => prev.filter(l => l._id !== id));
      } else {
        const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          if (res.status === 401) {
            // 認証情報が無いまたは無効（セッション有効期限切れ等）の時に削除しようとした時に表示
            alert('この操作をするにはログインが必要です。ログインページに移動します。');
            router.push('/login');
          } else {
            throw new Error('削除に失敗しました');
          }
          return;
        }
        setLogs(prev => prev.filter(l => l._id !== id));
      }

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

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedLog(null);
    router.replace('/logs');
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAuthenticated
            ? session.user?.name
              ? `${session.user.name}さんの学習ログ`
              : '学習ログ'
            : isGuestViewing
            ? 'ゲスト'
            : '学習ログ'}
        </h1>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem('guest_access');
                  } catch (e) {
                    console.warn('failed to remove guest_access', e);
                  }
                }

                // next-auth にサインアウトを実行させ、完了後にトップへリダイレクト
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                signOut({ callbackUrl: `${origin}/` });
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer"
            >
              Sign out
            </button>
          ) : isGuestViewing ? (
            <>
              <Link href="/login" className="px-3 py-1 border rounded-md text-sm hover:bg-gray-200">
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 border-black bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                新規登録
              </Link>
            </>
          ) : (
            // ログインもゲストでもない場合にログイン/登録を表示
            <>
              <Link href="/login" className="px-3 py-1 border rounded-md text-sm hover:bg-gray-200">
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ゲスト画面での注意メッセージ */}
      {isGuestViewing && (
        <div className="mb-4 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          ログインしていない場合データが失われる可能性があります。保存するには
          <Link href="/register" className="underline ml-1 font-medium text-red-500">
            新規登録
          </Link>
          してください。
        </div>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer"
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
