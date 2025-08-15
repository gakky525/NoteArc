import { describe, it, expect } from 'vitest';
// import { z } from 'zod';
import { registerSchema } from '@/lib/validators/auth';

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'longenough',
      name: 'Taro',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'longenough',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});
