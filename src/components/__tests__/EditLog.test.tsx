import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';

const saveGuestDraftMock = vi.fn();
const getGuestDraftsMock = vi.fn(() => []);
const removeGuestDraftMock = vi.fn();

vi.mock('@/lib/guestStorage', () => ({
  getGuestDrafts: () => getGuestDraftsMock(),
  saveGuestDraft: () => saveGuestDraftMock(),
  removeGuestDraft: () => removeGuestDraftMock(),
}));

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import EditLog from '@/components/EditLog';

describe('EditLog (guest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('saves guest draft on submit and redirects to /logs?open=... for guest', async () => {
    const log = {
      _id: 'temp-1',
      title: 'hello',
      content: 'content',
      date: new Date().toISOString(),
      tags: ['a'],
      _isGuest: true,
    };

    const { getByText } = render(<EditLog log={log} />);

    fireEvent.click(getByText('更新'));

    await waitFor(() => {
      expect(saveGuestDraftMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/logs?open=temp-1');
    });
  });
});
