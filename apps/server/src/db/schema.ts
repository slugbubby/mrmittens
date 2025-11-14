import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  twitchId: text('twitch_id').notNull().unique(),
  twitchUsername: text('twitch_username').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => usersTable.id)
    .notNull(),
  text: text('text').notNull(),
  doneAt: timestamp('done_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
