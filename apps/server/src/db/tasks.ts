/**
 * CRUD helpers for the `tasks` table.
 *
 * Tasks are created when a viewer sends `!task <text>` in Twitch chat
 * and rendered on the `/tasks` frontend route for the OBS browser source.
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, isNull, isNotNull } from 'drizzle-orm';

import { NewTask, Task, tasksTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

/**
 * Fetch tasks from the database.
 * @param options.done - When provided, filters by completion status
 *   (`true` = only done tasks, `false` = only pending tasks).
 *   Omit to return all tasks regardless of status.
 */
export const fetchTasks = async (options?: {
  done: boolean;
}): Promise<Task[]> => {
  let query = db.select().from(tasksTable).$dynamic();

  if (options?.done === true) {
    query = query.where(isNotNull(tasksTable.doneAt));
  } else if (options?.done === false) {
    query = query.where(isNull(tasksTable.doneAt));
  }

  return query;
};

/**
 * Create a new task for a user.
 * @param userId - Internal UUID of the user (from `usersTable`).
 * @param text - Task description as typed by the viewer.
 * @returns The newly created task row.
 */
export const createTask = async (
  userId: string,
  text: string,
): Promise<Task> => {
  const task: NewTask = {
    userId,
    text,
  };
  const returning = await db.insert(tasksTable).values(task).returning();
  return returning[0];
};

/** Permanently delete a task by its UUID. */
export const deleteTask = async (taskId: string) => {
  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
};
