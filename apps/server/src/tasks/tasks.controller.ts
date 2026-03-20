/**
 * REST controller for the `/tasks` endpoint.
 *
 * Consumed by the SvelteKit client (and the OBS browser source)
 * to display the current task list on stream.
 */

import { Controller, Get } from '@nestjs/common';

import { Task, User } from '../db/schema';
import { fetchTasks } from '../db/tasks';
import { TasksService } from './tasks.service';

type TaskWithUser = Task & { user: User };

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** Return every task in the database (all users, all statuses). */
  @Get()
  getTasks(): Promise<TaskWithUser[]> {
    return fetchTasks();
  }
}
