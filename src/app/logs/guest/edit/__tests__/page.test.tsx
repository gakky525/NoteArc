// src/app/logs/guest/edit/__tests__/page.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ tempId: 'g-1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const getGuestDraftsMock = vi.fn();
vi.mock('@/lib/guestStorage', () => ({ getGuestDrafts: () => getGuestDraftsMock() }));

beforeEach(() => {
  vi.clearAllMocks();
});

import GuestEditPage from '@/app/logs/guest/edit/[tempId]/page';

describe('GuestEditPage', () => {
  it('shows not found when draft missing', async () => {
    getGuestDraftsMock.mockReturnValue([]);
    const { findByText } = render(<GuestEditPage />);
    await waitFor(() =>
      expect(findByText('指定された下書きが見つかりません。')).resolves.toBeTruthy()
    );
  });

  it('renders EditLog when draft exists', async () => {
    getGuestDraftsMock.mockReturnValue([
      {
        tempId: 'g-1',
        title: 'T1',
        content: 'C1',
        tags: ['a'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    const { findByText } = render(<GuestEditPage />);
    await waitFor(() => expect(findByText('ログ編集')).resolves.toBeTruthy());
  });
});
