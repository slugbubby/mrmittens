import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { NewTask, Task, tasksTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

export const fetchTasks = async (options?: {
  done: boolean;
}): Promise<Task[]> => {
  const tasks = await db.select().from(tasksTable);
  // .where(eq(tasksTable.doneAt, userTwitchId));

  return tasks;
};

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

export const deleteTask = async (taskId: string) => {
  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
};
