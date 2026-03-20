import type { ChatCommandResult, DbTaskWithUserRecord, DbUserRecord } from '@mrmittens/shared';

// Chat moves fast, attention spans do not. Keep tasks short enough to fit in chat,
// overlays, and the general human experience of not wanting to read a novel mid-stream.
const MAX_TASK_LENGTH = 160;

export interface ChatIdentity {
  userId: string;
  userName: string;
  userDisplayName: string;
}

export interface TaskCommandRepository {
  fetchUserByTwitchId(twitchId: string): Promise<DbUserRecord | null>;
  createUser(
    twitchId: string,
    twitchUsername: string,
    displayName: string,
  ): Promise<DbUserRecord>;
  updateUser(
    twitchId: string,
    twitchUsername: string,
    displayName: string,
  ): Promise<DbUserRecord>;
  createTask(userId: string, text: string): Promise<{ id: string }>;
  fetchOpenTasks(): Promise<DbTaskWithUserRecord[]>;
  fetchOpenTasksForUser(userId: string): Promise<DbTaskWithUserRecord[]>;
  markTaskDone(taskId: string): Promise<{ id: string } | null>;
}

export const normalizeTaskText = (params: string[]): string | null => {
  // Twitch chat users are many things. Consistent about whitespace is not one of them.
  const taskText = params.join(' ').trim().replace(/\s+/g, ' ');

  if (!taskText) {
    return null;
  }

  return taskText.length <= MAX_TASK_LENGTH
    ? taskText
    : taskText.slice(0, MAX_TASK_LENGTH).trimEnd();
};

export const parseDoneTaskNumber = (params: string[]): number | null => {
  // `!done` with no number means "finish my oldest task".
  // `!done 3` means "finish task #3".
  // `!done banana` means the user has chosen chaos.
  if (params.length === 0) {
    return null;
  }

  if (params.length !== 1 || !/^\d+$/.test(params[0])) {
    return Number.NaN;
  }

  const value = Number.parseInt(params[0], 10);
  return value > 0 ? value : Number.NaN;
};

const ensureViewer = async (
  repository: TaskCommandRepository,
  identity: ChatIdentity,
): Promise<DbUserRecord> => {
  // Keep Twitch profile info fresh so the overlay does not become a museum of old usernames.
  const existingUser = await repository.fetchUserByTwitchId(identity.userId);

  if (!existingUser) {
    return repository.createUser(
      identity.userId,
      identity.userName,
      identity.userDisplayName,
    );
  }

  if (
    existingUser.twitchUsername !== identity.userName ||
    existingUser.displayName !== identity.userDisplayName
  ) {
    return repository.updateUser(
      identity.userId,
      identity.userName,
      identity.userDisplayName,
    );
  }

  return existingUser;
};

export const handleTaskCommand = async (
  repository: TaskCommandRepository,
  identity: ChatIdentity,
  params: string[],
): Promise<ChatCommandResult> => {
  // All command handlers return plain result objects so the chatbot layer can stay dumb.
  // Dumb is good here. Dumb code trips over fewer rakes.
  const taskText = normalizeTaskText(params);

  if (!taskText) {
    return {
      ok: false,
      message: 'Usage: !task <what you are working on>',
    };
  }

  const viewer = await ensureViewer(repository, identity);
  await repository.createTask(viewer.id, taskText);

  return {
    ok: true,
    message: `Task added: ${taskText}`,
  };
};

export const handleDoneCommand = async (
  repository: TaskCommandRepository,
  identity: ChatIdentity,
  params: string[],
): Promise<ChatCommandResult> => {
  const parsedNumber = parseDoneTaskNumber(params);

  if (Number.isNaN(parsedNumber)) {
    return {
      ok: false,
      message: 'Usage: !done or !done <task number>',
    };
  }

  const viewer = await repository.fetchUserByTwitchId(identity.userId);
  if (!viewer && parsedNumber === null) {
    return {
      ok: false,
      message: 'You do not have any open tasks to finish yet.',
    };
  }

  let selectedTask: DbTaskWithUserRecord | undefined;

  if (parsedNumber === null) {
    // No number: finish the chatter's oldest open task.
    // It is the fairest option and saves everyone from playing task-file archaeology.
    const viewerTasks = await repository.fetchOpenTasksForUser(viewer!.id);
    selectedTask = viewerTasks[0];

    if (!selectedTask) {
      return {
        ok: false,
        message: 'You do not have any open tasks to finish right now.',
      };
    }
  } else {
    // Numbered completion uses the globally visible board index so chat and overlay agree.
    // If they disagree, someone eventually yells at the bot, and frankly the bot has enough going on.
    const openTasks = await repository.fetchOpenTasks();
    selectedTask = openTasks[parsedNumber - 1];

    if (!selectedTask) {
      return {
        ok: false,
        message: `Task #${parsedNumber} is not on the board right now.`,
      };
    }
  }

  const completedTask = await repository.markTaskDone(selectedTask.id);
  if (!completedTask) {
    return {
      ok: false,
      message: 'I found that task, but could not mark it done. Please try again.',
    };
  }

  return {
    ok: true,
    message:
      parsedNumber === null
        ? `Task done: ${selectedTask.text}`
        : `Task #${parsedNumber} done: ${selectedTask.text}`,
  };
};
