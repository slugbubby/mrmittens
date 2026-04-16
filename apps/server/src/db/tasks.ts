import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import * as schema from './schema';
import { NewTask, Task, tasksTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

export const fetchTasks = async () => {
  return db.query.tasksTable.findMany({
    with: {
      user: true,
    },
  });
};

type TasksWithUser = Awaited<ReturnType<typeof fetchTasks>>;
export type TaskWithUser = TasksWithUser[number];

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
