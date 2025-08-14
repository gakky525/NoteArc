import NextAuth, {
  NextAuthOptions,
  User as NextAuthUser,
  Session,
} from 'next-auth';
import type { SessionOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

type AuthUser = NextAuthUser & { id: string }; // NextAuth の User に id を追加した型

const authOptions: NextAuthOptions = {
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
        const found = await UserModel.findOne({
          email: parsed.data.email,
        }).lean();

        if (!found) return null;

        const ok = await bcrypt.compare(parsed.data.password, found.password);
        if (!ok) return null;

        // NextAuth が期待する user オブジェクト
        const out: AuthUser = {
          id: found._id.toString(),
          name: found.name ?? undefined,
          email: found.email,
        } as AuthUser;

        return out;
      },
    }),
  ],

  pages: { signIn: '/login' },

  session: { jwt: true } as unknown as SessionOptions,

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }): Promise<JWT> {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user && token.sub) {
        // session.user の型に id が無い場合があるのでキャストして代入
        (session.user as unknown as { id?: string }).id = token.sub as
          | string
          | undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === 'true',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
