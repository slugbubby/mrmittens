/**
 * REST controller for the `/tasks` endpoint.
 *
 * Consumed by the SvelteKit client (and the OBS browser source)
 * to display the current task list on stream.
 */

import { Controller, Get } from '@nestjs/common';
import type { TasksOverlayResponse } from '@mrmittens/shared';

import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** Return the current open-task overlay payload for the browser source. */
  @Get()
  getTasks(): Promise<TasksOverlayResponse> {
    return this.tasksService.getOverlayTasks();
  }
}
