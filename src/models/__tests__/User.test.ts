// Model の存在とインスタンス化を確認
import { describe, it, expect } from 'vitest';
import User, { IUser } from '@/models/User';

describe('models/User', () => {
  it('exports a mongoose model and can create an instance with fields', () => {
    const doc = new User({ email: 'a@b.com', password: 'secret', name: 'Alice' }) as IUser;

    expect(doc).toBeDefined();
    expect(doc.email).toBe('a@b.com');
    expect(doc.password).toBe('secret');
    expect(doc.name).toBe('Alice');

    const obj = doc.toObject({ getters: false, virtuals: false }) as Record<string, unknown>;
    expect(obj.email).toBe('a@b.com');
    expect(obj.password).toBe('secret');
    expect(obj.name).toBe('Alice');
  });
});
