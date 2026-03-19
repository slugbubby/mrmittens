import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import * as schema from './schema';
import { NewTask, Task, tasksTable, User } from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

type TaskWithUser = Task & { user: User };

export const fetchTasks = async (options?: {
  done: boolean;
}): Promise<TaskWithUser[]> => {
  const tasks = db.query.tasksTable.findMany({
    with: { user: true },
  });

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
