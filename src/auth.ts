import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { v4 as uuidv4 } from 'uuid';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Initialize premium set for new OAuth users
      const apiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 32)}`;
      await db.update(users).set({
        apiKey: apiKey,
        balance: 20.0,
        lastReset: new Date(),
      }).where(eq(users.id, user.id!));
    }
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
});
