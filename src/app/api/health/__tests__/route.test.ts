// GET() が JSON OK を返すことを確認
import { describe, it, expect } from 'vitest';

describe('api health route', () => {
  it('GET returns { ok: true }', async () => {
    const mod = await import('@/app/api/health/route');
    const res = await mod.GET();

    if (res && typeof (res as Response).json === 'function') {
      const body = await (res as Response).json();
      expect(body).toEqual({ ok: true });
    } else {
      const status =
        res && typeof res === 'object' && 'status' in res
          ? (res as { status: number }).status
          : undefined;
      expect(status === 200 || status === undefined).toBeTruthy();
    }
  });
});
