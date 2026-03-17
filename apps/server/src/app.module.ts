/**
 * Root NestJS module.
 *
 * Registers all feature modules. Currently only {@link TasksModule} is active.
 * Future modules (e.g. users, messages, websockets) should be added to `imports`.
 */

import { Module } from '@nestjs/common';

import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
