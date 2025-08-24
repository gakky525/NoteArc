// src/components/__tests__/LogModal.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// mock next-auth react useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// mock next/navigation's useRouter to avoid "app router not mounted" invariant
const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

// mock guest storage remove
const removeGuestDraftMock = vi.fn();
vi.mock('@/lib/guestStorage', () => ({
  removeGuestDraft: (id: string) => removeGuestDraftMock(id),
}));

import LogModal from '@/components/LogModal';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('LogModal', () => {
  it('does not render account save button for guest (guest-only UI removed in modal)', () => {
    const log = {
      _id: 'g1',
      title: 'Guest Log',
      content: 'hello',
      date: new Date().toISOString(),
      tags: [],
      _isGuest: true,
    };

    render(<LogModal log={log} open={true} onClose={() => {}} onRequestDelete={() => {}} />);

    // The previous code had "アカウントに保存" button — ensure it's not present if we've removed it.
    const button = screen.queryByText(/アカウントに保存|保存中…/);
    expect(button).toBeNull();
    // We also expect the title and content to be rendered
    expect(screen.getByText('Guest Log')).toBeTruthy();
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
