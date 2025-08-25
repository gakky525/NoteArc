// NextAuth(authOptions) をモック化して、GET/POST が関数としてエクスポートされることを確認
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.resetModules();

describe('api auth route handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('exports GET and POST handler functions (NextAuth is mocked)', async () => {
    vi.doMock('next-auth', () => {
      return {
        default: (opts: unknown) => {
          return (req: unknown, res: unknown) => {
            return { calledWith: { req, res, opts } };
          };
        },
      };
    });

    vi.doMock('@/lib/nextAuthOptions', () => ({
      authOptions: { providers: [] },
    }));

    const mod = await import('@/app/api/auth/[...nextauth]/route');

    // GET / POST が存在することを確認
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');

    const result = (mod.GET as (...args: unknown[]) => unknown)('reqValue', 'resValue');

    expect(result).toBeDefined();
    if (typeof result === 'object' && result !== null) {
      // result.calledWith があることをチェック
      const calledWith = (result as Record<string, unknown>).calledWith;
      expect(calledWith).toBeDefined();
      // オプショナルに中身のキーを検査
      if (calledWith && typeof calledWith === 'object') {
        expect('opts' in calledWith || 'req' in calledWith).toBeTruthy();
      }
    }
  });
});
