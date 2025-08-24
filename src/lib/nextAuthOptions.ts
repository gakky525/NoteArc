import type { NextAuthOptions, User as NextAuthUser, Session, SessionOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import type { JWT } from 'next-auth/jwt';

type AuthUser = NextAuthUser & { id: string };

type FoundUser = {
  _id: { toString(): string };
  name?: string;
  email: string;
  password: string;
} | null;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials) return null;

        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        await connectToDatabase();
        const found = (await UserModel.findOne({
          email: parsed.data.email,
        }).lean()) as FoundUser;

        if (!found) return null;

        const ok = await bcrypt.compare(parsed.data.password, found.password);
        if (!ok) return null;

        const out: AuthUser = {
          id: found._id.toString(),
          name: found.name ?? undefined,
          email: found.email,
        };

        return out;
      },
    }),
  ],

  pages: { signIn: '/login' },

  session: { strategy: 'jwt' } as SessionOptions,

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }): Promise<JWT> {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token.sub) {
        (session.user as unknown as { id?: string }).id = token.sub as string | undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === 'true',
};
