/**
 * NestJS feature module for task management.
 *
 * Bundles the tasks HTTP controller and service together.
 * Imported by {@link ../app.module.ts | AppModule}.
 */

import { Module } from '@nestjs/common';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
