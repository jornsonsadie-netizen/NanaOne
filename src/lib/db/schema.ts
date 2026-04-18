import { pgTable, text, real, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  username: text('username').unique(),
  phone: text('phone').unique(),
  apiKey: text('api_key').unique(),
  balance: real('balance').default(20.0), // Daily balance
  oneTimeBalance: real('one_time_balance').default(0.0), // Non-resetting balance
  lastReset: timestamp('last_reset'),
  createdAt: timestamp('created_at').defaultNow(),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'), // Human-readable reason
  abuseFlags: text('abuse_flags'), // JSON array of flag events for review
  abuseFlagCount: integer('abuse_flag_count').default(0),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: [account.provider, account.providerAccountId],
    },
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    {
      compoundKey: [vt.identifier, vt.token],
    },
  ]
);

export const verificationCodes = pgTable('verification_codes', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: integer('id').primaryKey(),
  upstreamEndpoint: text('upstream_endpoint'),
  upstreamKey: text('upstream_key'),
  adminPassword: text('admin_password'),
  contextLimit: integer('context_limit').default(16000),
  maxOutputTokens: integer('max_output_tokens').default(4000),
});

export const models = pgTable('models', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  provider: text('provider'),
  enabled: boolean('enabled').default(true),
});

export const redeemCodes = pgTable('redeem_codes', {
  code: text('code').primaryKey(),
  amount: real('amount').notNull(),
  isUsed: boolean('is_used').default(false),
  usedBy: text('used_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usageLogs = pgTable('usage_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  modelId: text('model_id'),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  cost: real('cost'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const curationLogs = pgTable('curation_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  requestId: text('request_id'),
  originalTokens: integer('original_tokens'),
  curatedTokens: integer('curated_tokens'),
  curationSteps: text('curation_steps'), // JSON string of steps
  status: text('status'),
  modelUsed: text('model_used'),
  createdAt: timestamp('created_at').defaultNow(),
});
