import { pgTable, foreignKey, serial, integer, text, doublePrecision, timestamp, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const walletTransactions = pgTable("wallet_transactions", {
	id: serial().primaryKey().notNull(),
	walletId: integer("wallet_id").notNull(),
	transactionType: text("transaction_type").notNull(),
	amount: doublePrecision().notNull(),
	currencyType: text("currency_type").notNull(),
	status: text().default('pending').notNull(),
	referenceId: text("reference_id"),
	description: text(),
	transactionHash: text("transaction_hash"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.walletId],
			foreignColumns: [wallets.id],
			name: "wallet_transactions_wallet_id_wallets_id_fk"
		}),
]);

export const wallets = pgTable("wallets", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	currencyType: text("currency_type").notNull(),
	balance: doublePrecision().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "wallets_user_id_user_id_fk"
		}),
]);

export const adminWallets = pgTable("admin_wallets", {
	id: serial().primaryKey().notNull(),
	currencyType: text("currency_type").notNull(),
	balance: doublePrecision().default(0).notNull(),
	totalEarned: doublePrecision("total_earned").default(0).notNull(),
	totalWithdrawn: doublePrecision("total_withdrawn").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const disputes = pgTable("disputes", {
	id: serial().primaryKey().notNull(),
	taskSubmissionId: integer("task_submission_id"),
	raisedById: text("raised_by_id"),
	reason: text().notNull(),
	description: text().notNull(),
	status: text().default('open').notNull(),
	resolution: text(),
	resolvedById: text("resolved_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.raisedById],
			foreignColumns: [user.id],
			name: "disputes_raised_by_id_user_id_fk"
		}),
	foreignKey({
			columns: [table.resolvedById],
			foreignColumns: [user.id],
			name: "disputes_resolved_by_id_user_id_fk"
		}),
	foreignKey({
			columns: [table.taskSubmissionId],
			foreignColumns: [taskSubmissions.id],
			name: "disputes_task_submission_id_task_submissions_id_fk"
		}),
]);

export const adminSettings = pgTable("admin_settings", {
	id: serial().primaryKey().notNull(),
	commissionRate: doublePrecision("commission_rate").default(0.1).notNull(),
	adminUsername: text("admin_username").default('admin').notNull(),
	adminPasswordHash: text("admin_password_hash").notNull(),
	adminEmail: text("admin_email"),
	totalEarnings: doublePrecision("total_earnings").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id"),
	taskSubmissionId: integer("task_submission_id"),
	amount: doublePrecision().notNull(),
	currency: text().default('USD').notNull(),
	paymentType: text("payment_type").notNull(),
	status: text().default('pending').notNull(),
	paymentMethod: text("payment_method"),
	paymentAddress: text("payment_address"),
	transactionHash: text("transaction_hash"),
	notes: text(),
	commissionAmount: doublePrecision("commission_amount"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.taskSubmissionId],
			foreignColumns: [taskSubmissions.id],
			name: "payments_task_submission_id_task_submissions_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payments_user_id_user_id_fk"
		}),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id"),
	reviewerId: text("reviewer_id"),
	revieweeId: text("reviewee_id"),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.revieweeId],
			foreignColumns: [user.id],
			name: "reviews_reviewee_id_user_id_fk"
		}),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [user.id],
			name: "reviews_reviewer_id_user_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "reviews_task_id_tasks_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	icon: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	categoryId: integer("category_id"),
	employerId: text("employer_id"),
	status: text().default('open').notNull(),
	price: doublePrecision().notNull(),
	currency: text().default('USD').notNull(),
	timeEstimate: integer("time_estimate"),
	slots: integer().default(1).notNull(),
	slotsFilled: integer("slots_filled").default(0).notNull(),
	requirements: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "tasks_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.employerId],
			foreignColumns: [user.id],
			name: "tasks_employer_id_user_id_fk"
		}),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const taskSubmissions = pgTable("task_submissions", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id"),
	workerId: text("worker_id"),
	status: text().default('pending').notNull(),
	submissionData: text("submission_data"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	reviewerNotes: text("reviewer_notes"),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_submissions_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [user.id],
			name: "task_submissions_worker_id_user_id_fk"
		}),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	role: text().default('worker').notNull(),
	avatar: text(),
	bio: text(),
	phone: text(),
	onboardingCompleted: boolean("onboarding_completed").default(false),
	profilePicture: text("profile_picture"),
	skills: text(),
	experience: text(),
	education: text(),
	location: text(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	interests: text(),
	availability: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const userStats = pgTable("user_stats", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	tasksCompleted: integer("tasks_completed").default(0).notNull(),
	tasksPosted: integer("tasks_posted").default(0).notNull(),
	totalEarned: doublePrecision("total_earned").default(0).notNull(),
	totalSpent: doublePrecision("total_spent").default(0).notNull(),
	averageRating: doublePrecision("average_rating").default(0).notNull(),
	successRate: doublePrecision("success_rate").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_stats_user_id_user_id_fk"
		}),
	unique("user_stats_user_id_unique").on(table.userId),
]);
