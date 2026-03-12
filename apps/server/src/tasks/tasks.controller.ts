import { Controller, Get } from '@nestjs/common';

import { Task } from '../db/schema';
import { fetchTasks } from '../db/tasks';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {} // use this.tasksService.methodName()

  @Get()
  getTasks(): Promise<Task[]> {
    return fetchTasks();
  }
}
