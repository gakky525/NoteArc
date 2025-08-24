import { beforeEach, describe, expect, it } from 'vitest';
import {
  getGuestDrafts,
  saveGuestDraft,
  removeGuestDraft,
  clearGuestDrafts,
  createGuestDraft,
  hasGuestDrafts,
} from '@/lib/guestStorage';

describe('guestStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('createGuestDraft returns a draft and it is stored', () => {
    const d = createGuestDraft({ title: 't1', content: 'c1', tags: ['a'] });
    const all = getGuestDrafts();
    expect(all.length).toBe(1);
    expect(all[0].tempId).toBe(d.tempId);
    expect(all[0].title).toBe('t1');
    expect(hasGuestDrafts()).toBe(true);
  });

  it('saveGuestDraft upserts draft (update path)', () => {
    const d = createGuestDraft({ title: 'orig', content: 'o', tags: [] });
    const updated = saveGuestDraft({ ...d, title: 'updated' });
    const all = getGuestDrafts();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('updated');
    expect(updated.createdAt).toBeDefined();
    expect(updated.updatedAt).toBeDefined();
  });

  it('removeGuestDraft removes the right draft', () => {
    const a = createGuestDraft({ title: 'a', content: '', tags: [] });
    const b = createGuestDraft({ title: 'b', content: '', tags: [] });
    expect(getGuestDrafts().length).toBe(2);
    removeGuestDraft(a.tempId);
    const left = getGuestDrafts();
    expect(left.length).toBe(1);
    expect(left[0].tempId).toBe(b.tempId);
  });

  it('clearGuestDrafts clears all', () => {
    createGuestDraft({ title: 'a', content: '', tags: [] });
    createGuestDraft({ title: 'b', content: '', tags: [] });
    expect(getGuestDrafts().length).toBe(2);
    clearGuestDrafts();
    expect(getGuestDrafts().length).toBe(0);
  });
});
