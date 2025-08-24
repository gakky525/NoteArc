'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export type LogType = {
  _id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  _isGuest?: boolean;
};

type Props = {
  log: LogType | null;
  open: boolean;
  onClose: () => void;
  onRequestDelete: (id: string) => void;
};

export default function LogModal({ log, open, onClose, onRequestDelete }: Props) {
  const router = useRouter();
  if (!open || !log) return null;

  const currentLog = log as LogType;

  const handleEdit = () => {
    onClose();
    if (currentLog._isGuest) {
      router.push(`/logs/guest/edit/${currentLog._id}`);
    } else {
      router.push(`/logs/edit/${currentLog._id}`);
    }
  };

  const handleDeleteClick = () => {
    onRequestDelete(currentLog._id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-modal-title"
    >
      <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h2 id="log-modal-title" className="text-xl font-semibold">
              {currentLog.title}
              {currentLog._isGuest ? (
                <span className="ml-2 text-xs text-gray-500">（ゲスト）</span>
              ) : null}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {new Date(currentLog.date).toLocaleString()}
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {currentLog.tags?.map(t => (
                <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm border bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              onClick={handleEdit}
            >
              編集
            </button>

            <button
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              onClick={handleDeleteClick}
            >
              削除
            </button>

            <button
              className="px-3 py-1 text-sm border rounded bg-gray-200 hover:bg-gray-400 cursor-pointer"
              onClick={onClose}
            >
              閉じる
            </button>
          </div>
        </div>

        <div className="p-6 prose max-w-none">
          <ReactMarkdown>{currentLog.content || '*内容が空です*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
