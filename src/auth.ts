import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

// Module augmentation for custom session properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

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
    async signIn({ user, account }) {
      // 1. Check for banned GitHub account
      if (account?.provider === 'github' && account.providerAccountId) {
        const { bannedGithubIds } = require('@/lib/db/schema');
        const bannedAccount = await db.select().from(bannedGithubIds).where(eq(bannedGithubIds.githubId, account.providerAccountId)).limit(1);
        if (bannedAccount.length > 0) {
          console.warn(`[AUTH] Blocked login attempt from banned GitHub ID: ${account.providerAccountId}`);
          return false; // Deny sign-in
        }
      }

      // 2. Check for banned existing user
      if (user?.id) {
        const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        if (existingUser[0]?.banned) {
          console.warn(`[AUTH] Blocked login attempt from banned user ID: ${user.id}`);
          return false; // Deny sign-in
        }
      }

      return true; // Allow sign-in
    },
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
