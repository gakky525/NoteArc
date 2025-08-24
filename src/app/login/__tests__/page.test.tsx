import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../page';

// next-auth と next/navigation はテストではモックしておく
vi.mock('next-auth/react', () => {
  return {
    signIn: vi.fn(),
    useSession: () => ({ data: null, status: 'unauthenticated' }),
  };
});

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => ({ get: () => null }),
  };
});

describe('LoginPage', () => {
  it('renders input fields and button', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });
});
