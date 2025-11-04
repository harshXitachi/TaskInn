import { pgTable, serial, text, varchar, boolean, timestamp, integer, numeric, doublePrecision, uuid } from 'drizzle-orm/pg-core';



// Auth tables for better-auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("worker"),
  avatar: text("avatar"),
  bio: text("bio"),
  phone: text("phone"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profilePicture: text("profile_picture"),
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  location: text("location"),
  lastLogin: timestamp("last_login"),
  interests: text("interests"),
  availability: text("availability"),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  employerId: text("employer_id").references(() => user.id),
  status: text("status").notNull().default("open"),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  timeEstimate: integer("time_estimate"),
  slots: integer("slots").notNull().default(1),
  slotsFilled: integer("slots_filled").notNull().default(0),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Task Submissions table
export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  workerId: text("worker_id").references(() => user.id),
  status: text("status").notNull().default("pending"),
  submissionData: text("submission_data"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNotes: text("reviewer_notes"),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  taskSubmissionId: integer("task_submission_id").references(() => taskSubmissions.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentType: text("payment_type").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentAddress: text("payment_address"),
  transactionHash: text("transaction_hash"),
  notes: text("notes"),
  commissionAmount: doublePrecision("commission_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  reviewerId: text("reviewer_id").references(() => user.id),
  revieweeId: text("reviewee_id").references(() => user.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Disputes table
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  taskSubmissionId: integer("task_submission_id").references(() => taskSubmissions.id),
  raisedById: text("raised_by_id").references(() => user.id),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  resolvedById: text("resolved_by_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// User Stats table
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  tasksPosted: integer("tasks_posted").notNull().default(0),
  totalEarned: doublePrecision("total_earned").notNull().default(0),
  totalSpent: doublePrecision("total_spent").notNull().default(0),
  averageRating: doublePrecision("average_rating").notNull().default(0),
  successRate: doublePrecision("success_rate").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin Settings table
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  commissionRate: doublePrecision("commission_rate").notNull().default(0.1),
  adminUsername: text("admin_username").notNull().default("admin"),
  adminPasswordHash: text("admin_password_hash").notNull(),
  adminEmail: text("admin_email"),
  totalEarnings: doublePrecision("total_earnings").notNull().default(0),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

// Add new wallets table
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  currencyType: text('currency_type').notNull(), // "USD" or "USDT_TRC20"
  balance: doublePrecision('balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add new wallet_transactions table
export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  transactionType: text('transaction_type').notNull(), // "deposit", "withdrawal", "task_payment", "task_refund"
  amount: doublePrecision('amount').notNull(),
  currencyType: text('currency_type').notNull(),
  status: text('status').notNull().default('pending'), // "pending", "completed", "failed"
  referenceId: text('reference_id'),
  description: text('description'),
  transactionHash: text('transaction_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Add new admin_wallets table at the end
export const adminWallets = pgTable('admin_wallets', {
  id: serial('id').primaryKey(),
  currencyType: text('currency_type').notNull(), // "USD" or "USDT_TRC20"
  balance: doublePrecision('balance').notNull().default(0),
  totalEarned: doublePrecision('total_earned').notNull().default(0),
  totalWithdrawn: doublePrecision('total_withdrawn').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
