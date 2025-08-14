import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email({ message: '正しいメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上にしてください' }),
  name: z.string().max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
