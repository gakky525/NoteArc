export type GuestDraft = {
  tempId: string;
  title?: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  format?: 'plain' | 'markdown';
};

const STORAGE_KEY = 'notearc_guest_drafts_v1';

function safeParse<T>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('safeParse failed', e);
    return null;
  }
}

export function getGuestDrafts(): GuestDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse<unknown>(raw);
    if (!parsed) return [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(item => {
        if (item && typeof item === 'object') {
          const obj = item as Partial<GuestDraft>;
          return {
            tempId: typeof obj.tempId === 'string' ? obj.tempId : `guest-${Date.now()}`,
            title: typeof obj.title === 'string' ? obj.title : undefined,
            content: typeof obj.content === 'string' ? obj.content : undefined,
            tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
            createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
            updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
            format: obj.format === 'plain' || obj.format === 'markdown' ? obj.format : undefined,
          } as GuestDraft;
        }
        return null;
      })
      .filter(Boolean) as GuestDraft[];
  } catch (e) {
    console.warn('getGuestDrafts parse failed', e);
    return [];
  }
}

export function saveGuestDraft(draft: GuestDraft): GuestDraft {
  if (typeof window === 'undefined') return draft;
  const now = new Date().toISOString();
  const d: GuestDraft = {
    ...draft,
    updatedAt: draft.updatedAt ?? now,
    createdAt: draft.createdAt ?? now,
  };
  const all = getGuestDrafts();
  const idx = all.findIndex(x => x.tempId === d.tempId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...d };
  } else {
    all.unshift(d);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('saveGuestDraft failed to write localStorage', e);
  }
  return d;
}

export function createGuestDraft(input: {
  title?: string;
  content?: string;
  tags?: string[];
  format?: 'plain' | 'markdown';
}): GuestDraft {
  const tempId = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const draft: GuestDraft = {
    tempId,
    title: input.title ?? 'Untitled',
    content: input.content ?? '',
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    format: input.format ?? 'plain',
  };
  saveGuestDraft(draft);
  return draft;
}

export function removeGuestDraft(tempId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getGuestDrafts();
    const filtered = all.filter(d => d.tempId !== tempId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('removeGuestDraft failed', e);
  }
}

export function clearGuestDrafts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasGuestDrafts(): boolean {
  return getGuestDrafts().length > 0;
}

export function buildMergePayload() {
  const drafts = getGuestDrafts().map(d => ({
    tempId: d.tempId,
    title: d.title,
    content: d.content,
    tags: d.tags ?? [],
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
    format: d.format,
  }));
  return { drafts };
}
