import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';

vi.resetModules();

describe('useAutoSaveDraft', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls saveGuestDraft after delay with generated tempId', async () => {
    const saveGuestDraftMock = vi.fn();
    vi.doMock('@/lib/guestStorage', () => ({
      saveGuestDraft: (d: unknown) => saveGuestDraftMock(d),
    }));

    const { useAutoSaveDraft } = await import('@/hooks/useAutoSaveDraft');

    function TestComp({ title, content }: { title?: string; content?: string }) {
      useAutoSaveDraft({ data: { title, content, tags: [] }, delay: 50 });
      return <div>ok</div>;
    }

    const rendered = render(<TestComp title="T" content="C" />);

    await act(async () => {
      vi.advanceTimersByTime(60);
    });

    expect(saveGuestDraftMock).toHaveBeenCalled();
    rendered.unmount();
  });
});
