import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { NewUser, User, usersTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

export const fetchUser = async (userTwitchId: string): Promise<User | null> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.twitchId, userTwitchId));

  return users.length > 0 ? users[0] : null;
};

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

export const deleteUser = async (twitchId: string) => {
  await db.delete(usersTable).where(eq(usersTable.twitchId, twitchId));
};
