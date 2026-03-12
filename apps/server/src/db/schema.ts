// to test migration locally: pnpm drizzle-kit push
// then psql -h localhost -U postgres -d mittensdb and "\dt" in db to see tables
// https://orm.drizzle.team/docs/get-started/postgresql-new#step-6---applying-changes-to-the-database

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  twitchId: text('twitch_id').notNull().unique(),
  twitchUsername: text('twitch_username').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export const tasksTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  text: text('text').notNull(),
  doneAt: timestamp('done_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Task = InferSelectModel<typeof tasksTable>;
export type NewTask = InferInsertModel<typeof tasksTable>;

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

export type Message = InferSelectModel<typeof messagesTable>;
export type NewMessage = InferInsertModel<typeof messagesTable>;
