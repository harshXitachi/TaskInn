import { relations } from "drizzle-orm/relations";
import { wallets, walletTransactions, user, disputes, taskSubmissions, payments, reviews, tasks, account, categories, session, userStats } from "./schema";

export const walletTransactionsRelations = relations(walletTransactions, ({one}) => ({
	wallet: one(wallets, {
		fields: [walletTransactions.walletId],
		references: [wallets.id]
	}),
}));

export const walletsRelations = relations(wallets, ({one, many}) => ({
	walletTransactions: many(walletTransactions),
	user: one(user, {
		fields: [wallets.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	wallets: many(wallets),
	disputes_raisedById: many(disputes, {
		relationName: "disputes_raisedById_user_id"
	}),
	disputes_resolvedById: many(disputes, {
		relationName: "disputes_resolvedById_user_id"
	}),
	payments: many(payments),
	reviews_revieweeId: many(reviews, {
		relationName: "reviews_revieweeId_user_id"
	}),
	reviews_reviewerId: many(reviews, {
		relationName: "reviews_reviewerId_user_id"
	}),
	accounts: many(account),
	tasks: many(tasks),
	sessions: many(session),
	taskSubmissions: many(taskSubmissions),
	userStats: many(userStats),
}));

export const disputesRelations = relations(disputes, ({one}) => ({
	user_raisedById: one(user, {
		fields: [disputes.raisedById],
		references: [user.id],
		relationName: "disputes_raisedById_user_id"
	}),
	user_resolvedById: one(user, {
		fields: [disputes.resolvedById],
		references: [user.id],
		relationName: "disputes_resolvedById_user_id"
	}),
	taskSubmission: one(taskSubmissions, {
		fields: [disputes.taskSubmissionId],
		references: [taskSubmissions.id]
	}),
}));

export const taskSubmissionsRelations = relations(taskSubmissions, ({one, many}) => ({
	disputes: many(disputes),
	payments: many(payments),
	task: one(tasks, {
		fields: [taskSubmissions.taskId],
		references: [tasks.id]
	}),
	user: one(user, {
		fields: [taskSubmissions.workerId],
		references: [user.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	taskSubmission: one(taskSubmissions, {
		fields: [payments.taskSubmissionId],
		references: [taskSubmissions.id]
	}),
	user: one(user, {
		fields: [payments.userId],
		references: [user.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user_revieweeId: one(user, {
		fields: [reviews.revieweeId],
		references: [user.id],
		relationName: "reviews_revieweeId_user_id"
	}),
	user_reviewerId: one(user, {
		fields: [reviews.reviewerId],
		references: [user.id],
		relationName: "reviews_reviewerId_user_id"
	}),
	task: one(tasks, {
		fields: [reviews.taskId],
		references: [tasks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	reviews: many(reviews),
	category: one(categories, {
		fields: [tasks.categoryId],
		references: [categories.id]
	}),
	user: one(user, {
		fields: [tasks.employerId],
		references: [user.id]
	}),
	taskSubmissions: many(taskSubmissions),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	tasks: many(tasks),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userStatsRelations = relations(userStats, ({one}) => ({
	user: one(user, {
		fields: [userStats.userId],
		references: [user.id]
	}),
}));