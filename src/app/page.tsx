'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className='min-h-[80vh] flex items-center justify-center bg-slate-50 py-16'>
      <div className='w-full max-w-4xl mx-auto px-6'>
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='md:flex'>
            <div className='p-10 md:w-2/3'>
              <h1 className='text-4xl sm:text-5xl font-extrabold leading-tight mb-4'>
                メモ帳感覚で使える
                <span className='text-blue-600'> 学習ログ</span>
              </h1>
              <p className='text-gray-600 text-lg mb-6'>
                日々の学びを記録して、振り返りと継続をシンプルに。Markdown対応でメモ感覚に使える学習ログアプリです。
              </p>

              <ul className='grid gap-3 sm:grid-cols-3 mb-6'>
                <li className='flex items-start gap-3'>
                  <span className='mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      aria-hidden
                    >
                      <path
                        d='M5 12h14'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M5 6h14'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M5 18h14'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-medium'>かんたん記録</div>
                    <div className='text-sm text-gray-500'>
                      メモ帳感覚で気楽に使えます
                    </div>
                  </div>
                </li>

                <li className='flex items-start gap-3'>
                  <span className='mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      aria-hidden
                    >
                      <path
                        d='M12 5v14'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                      <path
                        d='M5 12h14'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-medium'>Markdown対応</div>
                    <div className='text-sm text-gray-500'>
                      見やすい形式で振り返りに最適
                    </div>
                  </div>
                </li>

                <li className='flex items-start gap-3'>
                  <span className='mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      aria-hidden
                    >
                      <circle
                        cx='12'
                        cy='12'
                        r='3'
                        stroke='currentColor'
                        strokeWidth='2'
                      />
                      <path
                        d='M19.4 15a7 7 0 10-14.8 0'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-medium'>タグで整理</div>
                    <div className='text-sm text-gray-500'>
                      タグで振り返りやすい
                    </div>
                  </div>
                </li>
              </ul>

              <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                <Link
                  href='/login'
                  className='inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  aria-label='ログインページへ'
                >
                  ログイン
                </Link>

                <Link
                  href='/register'
                  className='inline-flex items-center justify-center px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  aria-label='新規登録ページへ'
                >
                  新規登録
                </Link>

                <button
                  onClick={() => {
                    alert(
                      'ゲスト機能は後で実装します。まずは登録／ログインしてください。'
                    );
                  }}
                  className='inline-flex items-center justify-center px-5 py-3 rounded-lg border text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  aria-label='ゲストで試す（未実装）'
                >
                  ゲストで試す
                </button>
              </div>
            </div>

            <div className='hidden md:flex items-center justify-center md:w-1/3 bg-gradient-to-b from-blue-50 to-white p-6'>
              <div className='w-full max-w-xs'>
                <div className='rounded-lg border p-4 bg-white shadow-sm'>
                  {/* <div className='text-sm text-gray-500 mb-2'>今日の学習</div> */}
                  <h3 className='font-semibold'>Next.js + MongoDB</h3>
                  <p className='text-xs text-gray-500 mt-2 mb-3'>
                    Markdown でログを残して継続的に学習しましょう！
                  </p>
                  <div className='flex gap-2 flex-wrap'>
                    <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                      #nextjs
                    </span>
                    <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                      #mongodb
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='px-6 py-4 border-t text-sm text-gray-500'>
            <div className='max-w-3xl mx-auto'>
              アカウント登録するとデータが保存され、いつでも見返すことができます。
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
