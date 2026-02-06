// https://orm.drizzle.team/docs/get-started/postgresql-new

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { tasksTable, usersTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {}
main();

export const getUser = async (userTwitchId: string) => {
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
) => {
  const user: typeof usersTable.$inferInsert = {
    twitchId,
    twitchUsername,
    displayName,
  };

  return await db.insert(usersTable).values(user).returning()[0];
};

export const updateUser = async (
  twitchId: string,
  twitchUsername: string,
  displayName: string,
) => {
  return await db
    .update(usersTable)
    .set({
      twitchUsername,
      displayName,
    })
    .where(eq(usersTable.twitchId, twitchId))
    .returning()[0];
};

export const deleteUser = async (twitchId: string) => {
  await db.delete(usersTable).where(eq(usersTable.twitchId, twitchId));
};

export const createTask = async (userId: string, text: string) => {
  const task: typeof tasksTable.$inferInsert = {
    userId,
    text,
  };

  return await db.insert(tasksTable).values(task).returning()[0];
};

export const deleteTask = async (taskId: string) => {
  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
};
