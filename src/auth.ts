import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, bannedGithubIds } from "@/lib/db/schema";
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
    async signIn({ user, account }: any) {
      try {
        // 1. Check for banned GitHub account
        if (account?.provider === 'github' && account.providerAccountId) {
          const bannedAccount = await db.select().from(bannedGithubIds).where(eq(bannedGithubIds.githubId, account.providerAccountId)).limit(1);
          if (bannedAccount.length > 0) {
            console.warn(`[AUTH] Blocked login attempt from banned GitHub ID: ${account.providerAccountId}`);
            return "/vpn-detected?error=banned"; // Redirect to a page or return false
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
      } catch (error) {
        console.error("[AUTH ERROR] signIn callback failure:", error);
        return true; // Fail open to avoid blocking users if DB check fails temporarily
      }
    },
    async session({ session, user }: any) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: { user: any }) {
      try {
        // Initialize premium set for new OAuth users
        const apiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 32)}`;
        await db.update(users).set({
          apiKey: apiKey,
          balance: 20.0,
          lastReset: new Date(),
        }).where(eq(users.id, user.id!));
      } catch (error) {
        console.error("[AUTH ERROR] createUser event failure:", error);
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
});
