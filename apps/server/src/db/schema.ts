/**
 * Drizzle ORM schema definitions for the PostgreSQL database.
 *
 * All tables are defined here and exported alongside their inferred
 * TypeScript types (`User`, `NewUser`, etc.) so the rest of the app
 * gets type-safe DB access.
 *
 * Apply schema changes with: `pnpm drizzle-kit push`
 * Verify locally with: `psql -h localhost -U postgres -d mittensdb` then `\dt`
 *
 * @see https://orm.drizzle.team/docs/get-started/postgresql-new
 */

import { InferSelectModel, InferInsertModel, relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Twitch viewers who have interacted with the chatbot.
 * A user row is created on first `!task` command.
 */
export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  twitchId: text('twitch_id').notNull().unique(),
  twitchUsername: text('twitch_username').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/** Row returned from a `SELECT` on the users table. */
export type User = InferSelectModel<typeof usersTable>;
/** Shape accepted by `INSERT` into the users table (id and timestamps are auto-generated). */
export type NewUser = InferInsertModel<typeof usersTable>;

/**
 * Tasks created by viewers via the `!task` chat command.
 * Each task belongs to a user (`userId` FK) and tracks completion via `doneAt`.
 */
export const tasksTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  text: text('text').notNull(),
  /** Set when the viewer marks the task as done (null while in-progress). */
  doneAt: timestamp('done_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/** Row returned from a `SELECT` on the tasks table. */
export type Task = InferSelectModel<typeof tasksTable>;
/** Shape accepted by `INSERT` into the tasks table. */
export type NewTask = InferInsertModel<typeof tasksTable>;

/**
 * Raw chat messages stored for moderation / analytics.
 * `deletedAt` supports soft-delete for removed messages.
 */
export const messagesTable = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  text: text('text').notNull(),
  sentAt: timestamp('sent_at').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/** Row returned from a `SELECT` on the messages table. */
export type Message = InferSelectModel<typeof messagesTable>;
/** Shape accepted by `INSERT` into the messages table. */
export type NewMessage = InferInsertModel<typeof messagesTable>;

export const tasksRelations = relations(tasksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [tasksTable.userId],
    references: [usersTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  tasks: many(tasksTable),
}));
