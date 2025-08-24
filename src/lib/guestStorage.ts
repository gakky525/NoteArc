export type GuestDraft = {
  tempId: string;
  title?: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const STORAGE_KEY = 'notearc_guest_drafts_v1';

export function getGuestDrafts(): GuestDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GuestDraft[];
  } catch (e) {
    console.warn('getGuestDrafts parse failed', e);
    return [];
  }
}

export function saveGuestDraft(draft: GuestDraft): GuestDraft {
  if (typeof window === 'undefined') return draft;
  const now = new Date().toISOString();
  const d = { ...draft, updatedAt: draft.updatedAt ?? now, createdAt: draft.createdAt ?? now };
  const all = getGuestDrafts();
  const idx = all.findIndex(x => x.tempId === d.tempId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...d };
  } else {
    all.unshift(d);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return d;
}

export function createGuestDraft(input: {
  title?: string;
  content?: string;
  tags?: string[];
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
  }));
  return { drafts };
}
