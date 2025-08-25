import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders and calls onConfirm and onClose', async () => {
    const onConfirm = vi.fn(async () => Promise.resolve());
    const onClose = vi.fn();
    const { getByText } = render(
      <ConfirmDialog
        open
        title="Del"
        message="Are you sure?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    const btn = getByText('削除');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not render when open is false', () => {
    const { queryByText } = render(
      <ConfirmDialog open={false} onConfirm={vi.fn()} onClose={vi.fn()} />
    );
    expect(queryByText('削除')).toBeNull();
  });
});
