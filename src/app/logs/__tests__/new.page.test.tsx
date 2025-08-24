// src/app/logs/__tests__/new.page.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

let mockSessionData: unknown = null;
let mockSessionStatus: 'loading' | 'authenticated' | 'unauthenticated' = 'unauthenticated';

// mock next-auth useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSessionData, status: mockSessionStatus }),
}));

// mock router
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

// mock guestStorage.createGuestDraft
const createGuestDraftMock = vi.fn();
vi.mock('@/lib/guestStorage', () => ({
  createGuestDraft: (p: unknown) => createGuestDraftMock(p),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockSessionData = null;
  mockSessionStatus = 'unauthenticated';
});

afterEach(() => {
  // If global.fetch was replaced by a mock with mockRestore, call it.
  // Use a safe runtime check to avoid TypeScript ignore pragmas.
  const gf = global.fetch as unknown as { mockRestore?: () => void } | undefined;
  if (gf && typeof gf.mockRestore === 'function') {
    gf.mockRestore();
  }
});

import NewLogPage from '@/app/logs/new/page';

describe('NewLogPage', () => {
  it('authenticated -> posts to API and navigates to /logs', async () => {
    mockSessionData = { user: { id: 'u1' } };
    mockSessionStatus = 'authenticated';

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({ _id: 'srv-1' }),
      } as unknown as Response)
    );

    const { getByPlaceholderText, getByText } = render(<NewLogPage />);

    fireEvent.change(getByPlaceholderText('タイトルを入力'), { target: { value: 'T1' } });
    fireEvent.change(getByPlaceholderText('本文...'), { target: { value: 'C1' } });

    fireEvent.click(getByText('作成'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/logs');
    });
  });

  it('guest_access true -> createGuestDraft and navigate', async () => {
    localStorage.setItem('guest_access', 'true');

    const { getByPlaceholderText, getByText } = render(<NewLogPage />);

    fireEvent.change(getByPlaceholderText('タイトルを入力'), { target: { value: 'G-T' } });
    fireEvent.change(getByPlaceholderText('本文...'), { target: { value: 'G-C' } });

    fireEvent.click(getByText('作成'));

    await waitFor(() => {
      expect(createGuestDraftMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/logs');
    });
  });

  it('not guest and not auth -> auto guest save (or confirm flow) -> navigate', async () => {
    // ensure guest flag not set
    localStorage.removeItem('guest_access');
    mockSessionData = null;
    mockSessionStatus = 'unauthenticated';

    const { getByPlaceholderText, getByText } = render(<NewLogPage />);

    fireEvent.change(getByPlaceholderText('タイトルを入力'), { target: { value: 'Q' } });
    fireEvent.change(getByPlaceholderText('本文...'), { target: { value: 'R' } });

    // If your app still uses window.confirm, spy on it and return true.
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    try {
      fireEvent.click(getByText('作成'));

      await waitFor(() => {
        expect(createGuestDraftMock).toHaveBeenCalled();
        expect(localStorage.getItem('guest_access')).toBe('true');
        expect(pushMock).toHaveBeenCalledWith('/logs');
      });
    } finally {
      confirmSpy.mockRestore();
    }
  });
});
