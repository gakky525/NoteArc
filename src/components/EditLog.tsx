'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ConfirmDialog from './ConfirmDialog';
import { getGuestDrafts, saveGuestDraft, removeGuestDraft } from '@/lib/guestStorage';

type Log = {
  _id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  _isGuest?: boolean;
};

function parseTags(text: string): string[] {
  return text
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

export default function EditLog({ log }: { log: Log }) {
  const router = useRouter();

  const [title, setTitle] = useState(log.title);
  const [content, setContent] = useState(log.content);
  const [tagsText, setTagsText] = useState((log.tags || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);

  const saveTimerRef = useRef<number | null>(null);
  const tempId = log._id;

  const originalTagsString = useMemo(() => JSON.stringify(log.tags ?? []), [log.tags]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const drafts = getGuestDrafts();
      const found = drafts.find(d => d.tempId === tempId);
      if (found) {
        setHasLocalDraft(true);
      }
    } catch (e) {
      console.warn('failed to check guest drafts', e);
    }
  }, [tempId, log.title, log.content, originalTagsString]);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    saveTimerRef.current = window.setTimeout(() => {
      try {
        const now = new Date().toISOString();
        const existing = getGuestDrafts().find(d => d.tempId === tempId);
        const createdAt = existing?.createdAt ?? now;

        saveGuestDraft({
          tempId,
          title: title ?? '',
          content: content ?? '',
          tags: parseTags(tagsText),
          createdAt,
          updatedAt: now,
        });
      } catch (e) {
        console.warn('auto save failed', e);
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [title, content, tagsText, tempId]);

  function handleRestoreDraft() {
    try {
      const drafts = getGuestDrafts();
      const found = drafts.find(d => d.tempId === tempId);
      if (!found) {
        setHasLocalDraft(false);
        return;
      }
      if (found.title !== undefined) setTitle(found.title);
      if (found.content !== undefined) setContent(found.content);
      if (Array.isArray(found.tags)) setTagsText(found.tags.join(', '));
      setHasLocalDraft(false);
    } catch (e) {
      console.warn('restore failed', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = parseTags(tagsText);

      if (log._isGuest) {
        const now = new Date().toISOString();
        saveGuestDraft({
          tempId,
          title,
          content,
          tags,
          createdAt: getGuestDrafts().find(d => d.tempId === tempId)?.createdAt ?? now,
          updatedAt: now,
        });
        router.push(`/logs?open=${tempId}`);
        return;
      }

      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => null);
        throw new Error(t || '更新失敗');
      }

      try {
        removeGuestDraft(tempId);
      } catch (err) {
        console.warn('removeGuestDraft failed', err);
      }

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
      if (log._isGuest) {
        try {
          removeGuestDraft(tempId);
        } catch (err) {
          console.warn('removeGuestDraft failed', err);
        }
        router.push('/logs');
        return;
      }

      const res = await fetch(`/api/logs/${log._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除失敗');

      try {
        removeGuestDraft(tempId);
      } catch (err) {
        console.warn('removeGuestDraft failed', err);
      }

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

  const containerClass = showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'w-full';

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">ログ編集</h1>

      {/* ローカルストレージに下書きが存在するのに現在表示されている初期ログと内容が異なる場合に表示 */}
      {hasLocalDraft && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                ブラウザに下書きがあります。復元しますか？（現在の編集内容は上書きされます）
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestoreDraft}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                下書きを復元
              </button>
              <button
                onClick={() => {
                  try {
                    removeGuestDraft(tempId);
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    setHasLocalDraft(false);
                  }
                }}
                className="px-3 py-1 border rounded"
              >
                無視して削除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={containerClass}>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow">
          <div>
            <label className="block text-sm mb-1">タイトル</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? '更新中…' : '更新'}
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
            >
              削除
            </button>

            <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md">
              キャンセル
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(s => !s)}
              className="px-3 py-1 border rounded-md"
            >
              {showPreview ? 'プレビューを隠す' : 'プレビューを表示'}
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">プレビュー</h2>
              <span className="text-sm text-gray-500">Markdown 表示</span>
            </div>

            <article className="prose max-w-none">
              <h3>{title || 'タイトルのプレビュー'}</h3>
              <ReactMarkdown>{content || '内容のプレビュー（Markdown対応）'}</ReactMarkdown>
              <div className="mt-3">
                {parseTags(tagsText).map(t => (
                  <span key={t} className="text-xs bg-gray-100 px-2 py-1 mr-2 rounded">
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
        title="ログを削除しますか？"
        message="この操作は取り消せません。よろしいですか？"
        onConfirm={() => {
          setConfirmOpen(false);
          doDelete();
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </main>
  );
}
