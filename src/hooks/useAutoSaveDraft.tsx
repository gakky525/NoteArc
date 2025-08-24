'use client';
import { useEffect, useRef } from 'react';
import { GuestDraft, saveGuestDraft } from '@/lib/guestStorage';

type UseAutoSaveParams = {
  key?: string;
  data: { title?: string; content?: string; tags?: string[] };
  delay?: number;
};

function generateTempId(key?: string) {
  if (key) return `guest-${key}-${Date.now()}`;
  return `guest-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function useAutoSaveDraft({ key, data, delay = 600 }: UseAutoSaveParams) {
  const tempIdRef = useRef<string | null>(null);
  if (!tempIdRef.current) {
    tempIdRef.current = generateTempId(key);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = new Date().toISOString();
      const draft: GuestDraft = {
        tempId: tempIdRef.current!,
        title: data.title,
        content: data.content,
        tags: data.tags,
        createdAt: now,
        updatedAt: now,
      };
      try {
        saveGuestDraft(draft);
      } catch (e) {
        console.warn('useAutoSaveDraft save failed', e);
      }
    }, delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title, data.content, JSON.stringify(data.tags)]);
}
