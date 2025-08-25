import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next-auth/react', () => {
  return {
    SessionProvider: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

import Providers from '@/components/Providers';

describe('Providers', () => {
  it('renders children without calling next-auth network', () => {
    render(
      <Providers>
        <div>child</div>
      </Providers>
    );

    expect(screen.getByText('child')).toBeTruthy();
  });
});
