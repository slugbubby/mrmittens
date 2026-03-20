import type { DbTaskWithUserRecord, DbUserRecord } from '@mrmittens/shared';

import {
  handleDoneCommand,
  handleTaskCommand,
  normalizeTaskText,
  parseDoneTaskNumber,
  type TaskCommandRepository,
} from './task-command.handlers';

const defaultStreamerIdentity = {
  twitchUsername: 'streamer_login',
  displayName: 'Streamer Display',
};

const createUserRecord = (overrides: Partial<DbUserRecord> = {}): DbUserRecord => ({
  id: 'user-1',
  twitchId: 'twitch-user-1',
  twitchUsername: defaultStreamerIdentity.twitchUsername,
  displayName: defaultStreamerIdentity.displayName,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const createTaskRecord = (
  overrides: Partial<DbTaskWithUserRecord> = {},
): DbTaskWithUserRecord => ({
  id: 'task-1',
  userId: 'user-1',
  text: 'Fix the bug',
  doneAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  user: createUserRecord(),
  ...overrides,
});

const createRepository = (
  overrides: Partial<TaskCommandRepository> = {},
): TaskCommandRepository => ({
  fetchUserByTwitchId: jest.fn().mockResolvedValue(createUserRecord()),
  createUser: jest.fn().mockResolvedValue(createUserRecord()),
  updateUser: jest.fn().mockResolvedValue(createUserRecord()),
  createTask: jest.fn().mockResolvedValue({ id: 'task-99' }),
  fetchOpenTasks: jest.fn().mockResolvedValue([createTaskRecord()]),
  fetchOpenTasksForUser: jest.fn().mockResolvedValue([createTaskRecord()]),
  markTaskDone: jest.fn().mockResolvedValue({ id: 'task-1' }),
  ...overrides,
});

const identity = {
  userId: 'twitch-user-1',
  userName: defaultStreamerIdentity.twitchUsername,
  userDisplayName: defaultStreamerIdentity.displayName,
};

describe('task command handlers', () => {
  describe('normalizeTaskText', () => {
    it('returns null for empty input', () => {
      expect(normalizeTaskText(['   '])).toBeNull();
    });

    it('collapses extra whitespace', () => {
      expect(normalizeTaskText(['ship', '  the', ' overlay  '])).toBe(
        'ship the overlay',
      );
    });
  });

  describe('parseDoneTaskNumber', () => {
    it('returns null when no number is provided', () => {
      expect(parseDoneTaskNumber([])).toBeNull();
    });

    it('returns NaN for invalid input', () => {
      expect(parseDoneTaskNumber(['abc'])).toBeNaN();
      expect(parseDoneTaskNumber(['0'])).toBeNaN();
    });

    it('parses positive integers', () => {
      expect(parseDoneTaskNumber(['3'])).toBe(3);
    });
  });

  describe('handleTaskCommand', () => {
    it('rejects blank tasks', async () => {
      const repository = createRepository();

      await expect(handleTaskCommand(repository, identity, ['   '])).resolves.toEqual({
        ok: false,
        message: 'Usage: !task <what you are working on>',
      });
    });

    it('creates a task for a known viewer', async () => {
      const repository = createRepository();

      await expect(
        handleTaskCommand(repository, identity, ['ship', 'overlay']),
      ).resolves.toEqual({
        ok: true,
        message: 'Task added: ship overlay',
      });

      expect(repository.createTask).toHaveBeenCalledWith('user-1', 'ship overlay');
    });

    it('creates the viewer first when needed', async () => {
      const repository = createRepository({
        fetchUserByTwitchId: jest.fn().mockResolvedValue(null),
      });

      await handleTaskCommand(repository, identity, ['test']);

      expect(repository.createUser).toHaveBeenCalledWith(
        'twitch-user-1',
        defaultStreamerIdentity.twitchUsername,
        defaultStreamerIdentity.displayName,
      );
    });
  });

  describe('handleDoneCommand', () => {
    it('marks the chatter oldest task done when no number is provided', async () => {
      const repository = createRepository({
        fetchOpenTasksForUser: jest.fn().mockResolvedValue([
          createTaskRecord({ text: 'Oldest open task' }),
        ]),
      });

      await expect(handleDoneCommand(repository, identity, [])).resolves.toEqual({
        ok: true,
        message: 'Task done: Oldest open task',
      });

      expect(repository.markTaskDone).toHaveBeenCalledWith('task-1');
    });

    it('marks the global numbered task done', async () => {
      const repository = createRepository({
        fetchOpenTasks: jest.fn().mockResolvedValue([
          createTaskRecord({ id: 'task-1', text: 'First task' }),
          createTaskRecord({ id: 'task-2', text: 'Second task' }),
        ]),
        markTaskDone: jest.fn().mockResolvedValue({ id: 'task-2' }),
      });

      await expect(handleDoneCommand(repository, identity, ['2'])).resolves.toEqual({
        ok: true,
        message: 'Task #2 done: Second task',
      });

      expect(repository.markTaskDone).toHaveBeenCalledWith('task-2');
    });

    it('rejects invalid task numbers', async () => {
      const repository = createRepository();

      await expect(handleDoneCommand(repository, identity, ['abc'])).resolves.toEqual({
        ok: false,
        message: 'Usage: !done or !done <task number>',
      });
    });

    it('handles missing numbered tasks', async () => {
      const repository = createRepository({
        fetchOpenTasks: jest.fn().mockResolvedValue([]),
      });

      await expect(handleDoneCommand(repository, identity, ['7'])).resolves.toEqual({
        ok: false,
        message: 'Task #7 is not on the board right now.',
      });
    });
  });
});
