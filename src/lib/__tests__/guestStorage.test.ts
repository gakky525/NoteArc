import { beforeEach, describe, expect, it } from 'vitest';
import {
  getGuestDrafts,
  saveGuestDraft,
  removeGuestDraft,
  clearGuestDrafts,
  createGuestDraft,
  hasGuestDrafts,
  buildMergePayload,
  type GuestDraft,
} from '@/lib/guestStorage';

describe('guestStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('createGuestDraft returns a draft and it is stored with default format "plain"', () => {
    const d = createGuestDraft({ title: 't1', content: 'c1', tags: ['a'] });
    const all = getGuestDrafts();
    expect(all).toHaveLength(1);
    expect(all[0].tempId).toBe(d.tempId);
    expect(all[0].title).toBe('t1');
    expect(all[0].content).toBe('c1');
    expect(all[0].tags).toEqual(['a']);
    expect(all[0].format).toBe('plain'); // デフォルト
    expect(hasGuestDrafts()).toBe(true);
    expect(typeof all[0].createdAt).toBe('string');
    expect(typeof all[0].updatedAt).toBe('string');
  });

  it('createGuestDraft accepts explicit format and buildMergePayload includes format', () => {
    const d = createGuestDraft({ title: 'm', content: 'md', tags: [], format: 'markdown' });
    expect(d.format).toBe('markdown');

    const payload = buildMergePayload();
    expect(payload).toHaveProperty('drafts');
    expect(Array.isArray(payload.drafts)).toBe(true);
    const first = payload.drafts[0];
    expect(first).toHaveProperty('tempId', d.tempId);
    expect(first).toHaveProperty('content', 'md');
    expect(first).toHaveProperty('format', 'markdown');
  });

  it('saveGuestDraft upserts draft (update path) and preserves createdAt', () => {
    const d = createGuestDraft({ title: 'orig', content: 'o', tags: [] });
    const originalCreatedAt = d.createdAt;
    const updatedInput: GuestDraft = { ...d, title: 'updated' };
    const updated = saveGuestDraft(updatedInput);
    const all = getGuestDrafts();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('updated');
    expect(typeof updated.createdAt).toBe('string');
    expect(typeof updated.updatedAt).toBe('string');
    expect(updated.createdAt).toBe(originalCreatedAt);
    expect(new Date(updated.updatedAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(updated.createdAt!).getTime()
    );
  });

  it('removeGuestDraft removes the right draft', () => {
    const a = createGuestDraft({ title: 'a', content: '', tags: [] });
    const b = createGuestDraft({ title: 'b', content: '', tags: [] });
    expect(getGuestDrafts()).toHaveLength(2);
    removeGuestDraft(a.tempId);
    const left = getGuestDrafts();
    expect(left).toHaveLength(1);
    expect(left[0].tempId).toBe(b.tempId);
  });

  it('clearGuestDrafts clears all', () => {
    createGuestDraft({ title: 'a', content: '', tags: [] });
    createGuestDraft({ title: 'b', content: '', tags: [] });
    expect(getGuestDrafts()).toHaveLength(2);
    clearGuestDrafts();
    expect(getGuestDrafts()).toHaveLength(0);
  });

  it('getGuestDrafts returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('notearc_guest_drafts_v1', 'this-is-not-json');
    const drafts = getGuestDrafts();
    expect(Array.isArray(drafts)).toBe(true);
    expect(drafts).toHaveLength(0);
  });
});
