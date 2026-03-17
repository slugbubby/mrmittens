/**
 * Service layer for task business logic.
 *
 * Currently a placeholder -- task queries live in `db/tasks.ts` and are
 * called directly from the controller. As the app grows, move complex
 * logic (e.g. marking tasks done, pagination, permissions) here so the
 * controller stays thin.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {}
