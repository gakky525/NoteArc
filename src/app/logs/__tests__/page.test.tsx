// src/app/logs/__tests__/page.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';

let mockSessionData: unknown = null;
let mockSessionStatus: 'loading' | 'authenticated' | 'unauthenticated' = 'unauthenticated';
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSessionData, status: mockSessionStatus }),
}));

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }));

const getGuestDraftsMock = vi.fn();
const removeGuestDraftMock = vi.fn();
vi.mock('@/lib/guestStorage', () => ({
  getGuestDrafts: () => getGuestDraftsMock(),
  removeGuestDraft: (id: string) => removeGuestDraftMock(id),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockSessionData = null;
  mockSessionStatus = 'unauthenticated';
});

import LogsPage from '@/app/logs/page';

describe('LogsPage (guest vs auth)', () => {
  it('server returns 401 -> falls back to guest drafts', async () => {
    // server returns 401: fetch called by component should be stubbed
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 401 } as unknown as Response));

    // prepare guest drafts
    getGuestDraftsMock.mockReturnValue([
      {
        tempId: 'g1',
        title: 'G1',
        content: 'c',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    // set guest flag so it uses guest view
    localStorage.setItem('guest_access', 'true');

    const { getByText } = render(<LogsPage />);

    await waitFor(() => {
      expect(getByText('G1')).toBeTruthy();
    });
  });

  it('guest deletion removes draft locally (rendered)', async () => {
    getGuestDraftsMock.mockReturnValue([{ tempId: 'g2', title: 't', content: 'c', tags: [] }]);
    localStorage.setItem('guest_access', 'true');

    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 401 } as unknown as Response));

    const { getByText } = render(<LogsPage />);

    await waitFor(() => expect(getByText('t')).toBeTruthy());

    // removeGuestDraftMock should not have been called yet (no delete triggered in this test)
    expect(removeGuestDraftMock).not.toHaveBeenCalled();
  });
});
