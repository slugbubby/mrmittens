import type { DbTaskWithUserRecord } from '@mrmittens/shared';

import { buildTasksOverlayResponse } from './tasks.presenter';

const createTask = (
  overrides: Partial<DbTaskWithUserRecord> = {},
): DbTaskWithUserRecord => ({
  id: 'task-1',
  userId: 'user-1',
  text: 'Fix the bug',
  doneAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  user: {
    id: 'user-1',
    twitchId: 'viewer-1',
    twitchUsername: 'slugbubby',
    displayName: 'Slugbubby',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  ...overrides,
});

describe('buildTasksOverlayResponse', () => {
  it('numbers tasks globally while grouping by user', () => {
    const overlay = buildTasksOverlayResponse([
      createTask({ id: 'task-1', text: 'First', userId: 'user-1' }),
      createTask({
        id: 'task-2',
        text: 'Second',
        userId: 'user-2',
        user: {
          id: 'user-2',
          twitchId: 'viewer-2',
          twitchUsername: 'joy',
          displayName: 'Joy',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      }),
      createTask({ id: 'task-3', text: 'Third', userId: 'user-1' }),
    ]);

    expect(overlay.tasks.map((task) => task.displayNumber)).toEqual([1, 2, 3]);
    expect(overlay.groups).toHaveLength(2);
    expect(overlay.groups[0].tasks.map((task) => task.displayNumber)).toEqual([1, 3]);
    expect(overlay.groups[1].tasks.map((task) => task.displayNumber)).toEqual([2]);
  });
});
