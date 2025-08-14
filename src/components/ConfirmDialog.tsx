'use client';
import React, { useState } from 'react';

type Props = {
  open: boolean;
  title?: string;
  message?: string;

  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title = '確認',
  message = '本当によろしいですか？',
  onConfirm,
  onClose,
}: Props) {
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    try {
      setProcessing(true);
      await onConfirm();
    } catch (err) {
      console.error('ConfirmDialog onConfirm error', err);
    } finally {
      setProcessing(false);
      onClose();
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40'>
      <div className='bg-white rounded-lg shadow-lg max-w-md w-full p-6'>
        <h3 className='text-lg font-semibold mb-2'>{title}</h3>
        <p className='text-sm text-gray-600 mb-4'>{message}</p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={processing}
            className='px-3 py-1 border rounded-md disabled:opacity-50'
          >
            キャンセル
          </button>

          <button
            onClick={handleConfirm}
            disabled={processing}
            className='px-3 py-1 bg-red-600 text-white rounded-md disabled:opacity-50'
          >
            {processing ? '削除中…' : '削除'}
          </button>
        </div>
      </div>
    </div>
  );
}
