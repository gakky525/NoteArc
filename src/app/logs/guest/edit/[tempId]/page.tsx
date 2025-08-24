'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditLog from '@/components/EditLog';
import { getGuestDrafts, GuestDraft } from '@/lib/guestStorage';

export default function GuestEditPage() {
  const params = useParams() as { tempId?: string };
  const router = useRouter();
  const tempId = params?.tempId;

  const [draft, setDraft] = useState<GuestDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tempId) {
      setDraft(null);
      setLoading(false);
      return;
    }
    try {
      const drafts = getGuestDrafts();
      const found = drafts.find(d => d.tempId === tempId) ?? null;
      setDraft(found);
    } catch (e) {
      console.warn('failed to read guest draft', e);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, [tempId]);

  if (loading) {
    return <div className="py-10 text-center text-gray-500">読み込み中…</div>;
  }

  // 編集画面で指定したURL（例 /logs/guest/edit/guest-xxxx）が存在しない場合に表示
  if (!draft) {
    return (
      <div className="p-8 bg-white rounded-lg shadow text-center">
        <p className="text-gray-600 mb-4">指定された下書きが見つかりません。</p>
        <button
          onClick={() => router.push('/logs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          ログ一覧へ戻る
        </button>
      </div>
    );
  }

  const logProp = {
    _id: draft.tempId,
    title: draft.title ?? '',
    content: draft.content ?? '',
    date: draft.updatedAt ?? draft.createdAt ?? new Date().toISOString(),
    tags: draft.tags ?? [],
    _isGuest: true,
  };

  return (
    <main>
      <EditLog log={logProp} />
    </main>
  );
}
