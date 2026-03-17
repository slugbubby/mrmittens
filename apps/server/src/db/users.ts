/**
 * CRUD helpers for the `users` table.
 *
 * Users are Twitch viewers identified by their Twitch user-ID.
 * A row is auto-created when a viewer runs `!task` for the first time
 * (see {@link ../chatbot/index.ts}).
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { NewUser, User, usersTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

/**
 * Look up a user by their Twitch user-ID.
 * @returns The matching user, or `null` if they haven't interacted yet.
 */
export const fetchUser = async (userTwitchId: string): Promise<User | null> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.twitchId, userTwitchId));

  return users.length > 0 ? users[0] : null;
};

/**
 * Insert a new user from Twitch identity fields.
 * @returns The newly created user row (including generated `id`).
 */
export const createUser = async (
  twitchId: string,
  twitchUsername: string,
  displayName: string,
): Promise<User> => {
  const user: NewUser = {
    twitchId,
    twitchUsername,
    displayName,
  };
  const inserted = await db.insert(usersTable).values(user).returning();
  return inserted[0];
};

/**
 * Update a user's Twitch username and display name.
 * Useful when Twitch profile data changes between sessions.
 * @returns The updated user row.
 */
export const updateUser = async (
  twitchId: string,
  twitchUsername: string,
  displayName: string,
): Promise<User> => {
  const updated = await db
    .update(usersTable)
    .set({
      twitchUsername,
      displayName,
    })
    .where(eq(usersTable.twitchId, twitchId))
    .returning();
  return updated[0];
};

/** Permanently delete a user by their Twitch user-ID. */
export const deleteUser = async (twitchId: string) => {
  await db.delete(usersTable).where(eq(usersTable.twitchId, twitchId));
};
