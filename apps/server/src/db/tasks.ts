/**
 * CRUD helpers for the `tasks` table.
 *
 * Tasks are created when a viewer sends `!task <text>` in Twitch chat
 * and rendered on the `/tasks` frontend route for the OBS browser source.
 */

import 'dotenv/config';
import type { DbTaskWithUserRecord } from '@mrmittens/shared';
import { and, asc, eq, isNull, isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { NewTask, Task, tasksTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

const openTaskOrder = [asc(tasksTable.createdAt), asc(tasksTable.id)];

/**
 * Fetch tasks from the database.
 * @param options.done - When provided, filters by completion status
 *   (`true` = only done tasks, `false` = only pending tasks).
 *   Omit to return all tasks regardless of status.
 */
export const fetchTasks = async (options?: {
  done: boolean;
}): Promise<DbTaskWithUserRecord[]> => {
  return db.query.tasksTable.findMany({
    orderBy: openTaskOrder,
    where:
      options?.done === true
        ? isNotNull(tasksTable.doneAt)
        : options?.done === false
          ? isNull(tasksTable.doneAt)
          : undefined,
    with: { user: true },
  });
};

export const fetchOpenTasks = async (): Promise<DbTaskWithUserRecord[]> => {
  return fetchTasks({ done: false });
};

export const fetchOpenTasksForUser = async (
  userId: string,
): Promise<DbTaskWithUserRecord[]> => {
  return db.query.tasksTable.findMany({
    orderBy: openTaskOrder,
    where: and(eq(tasksTable.userId, userId), isNull(tasksTable.doneAt)),
    with: { user: true },
  });
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

export const markTaskDone = async (taskId: string): Promise<Task | null> => {
  const updatedTasks = await db
    .update(tasksTable)
    .set({
      doneAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tasksTable.id, taskId))
    .returning();

  return updatedTasks[0] ?? null;
};

/** Permanently delete a task by its UUID. */
export const deleteTask = async (taskId: string) => {
  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
};
