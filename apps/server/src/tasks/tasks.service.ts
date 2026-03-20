import { Injectable } from '@nestjs/common';
import type { TasksOverlayResponse } from '@mrmittens/shared';

import { fetchOpenTasks } from '../db/tasks';
import { buildTasksOverlayResponse } from './tasks.presenter';

@Injectable()
export class TasksService {
  async getOverlayTasks(): Promise<TasksOverlayResponse> {
    const openTasks = await fetchOpenTasks();
    return buildTasksOverlayResponse(openTasks);
  }
}
