/**
 * Twitch chatbot command handlers.
 *
 * Each export is a Twurple `BotCommand` registered in {@link ../main.ts}.
 * Commands are triggered when a viewer types `!<name>` in chat.
 */

import { createBotCommand } from '@twurple/easy-bot';

import { safeReply } from './chat-messaging';
import {
  handleDoneCommand,
  handleTaskCommand,
  type ChatIdentity,
  type TaskCommandRepository,
} from './task-command.handlers';
import {
  createTask,
  fetchOpenTasks,
  fetchOpenTasksForUser,
  markTaskDone,
} from '../db/tasks';
import { createUser, fetchUser, updateUser } from '../db/users';

const taskCommandRepository: TaskCommandRepository = {
  fetchUserByTwitchId: fetchUser,
  createUser,
  updateUser,
  createTask,
  fetchOpenTasks,
  fetchOpenTasksForUser,
  markTaskDone,
};

const createIdentity = (context: {
  userId: string;
  userName: string;
  userDisplayName: string;
}): ChatIdentity => ({
  userId: context.userId,
  userName: context.userName,
  userDisplayName: context.userDisplayName,
});

/**
 * `!slap <target>` -- A fun chat command.
 * Picks a random size + fish combo and announces that the sender
 * slapped the target with it. Pure entertainment, no side effects.
 */
export const slap = createBotCommand(
  'slap',
  async (params, { userName, say }) => {
    const size = [
      'cute',
      'micro',
      'smol',
      'tiny',
      'adequately sized',
      'large',
      'gigantic',
      'huge',
      'absurd',
    ];
    const fish = [
      'dolphin',
      'goldfish',
      'koi',
      'lobster',
      'mackerel',
      'mermaid',
      'octopus',
      'salmon',
      'shrimp',
      'swordfish',
      'trout',
      'tuna',
    ];
    const sizeIndex = Math.floor(Math.random() * size.length);
    const fishIndex = Math.floor(Math.random() * fish.length);
    await say(
      `${userName} slaps ${params.join(' ')} around a bit with a ${size[sizeIndex]} ${fish[fishIndex]}`,
    );
  },
);

export const suplex = createBotCommand(
  'suplex',
  async (params, { userName, say }) => {
    await say(
      `${userName} grabs ${params.join(' ')} firmly, with double underhooks, 
      interlocking their torsos. Gravity conductor? First stop: the sky! Final
      destination? DIRT. EAT THE HOT, HARD, SANDY FLOOR WITH YOUR ROCK OF A BIG
      HEAD. Attention chatter, you have arrived at Suplex City.`,
    );
  },
);

/**
 * `!task <description>` -- Create a stream task from chat.
 *
 * Looks up (or auto-creates) the viewer in the DB, then inserts a new
 * task row. The task shows up on the `/tasks` frontend page which is
 * used as an OBS browser source overlay.
 */
export const task = createBotCommand(
  'task',
  async (params, context) => {
    const result = await handleTaskCommand(
      taskCommandRepository,
      createIdentity(context),
      params,
    );

    await safeReply(context.reply, result.message);
  },
);

export const done = createBotCommand(
  'done',
  async (params, context) => {
    const result = await handleDoneCommand(
      taskCommandRepository,
      createIdentity(context),
      params,
    );

    await safeReply(context.reply, result.message);
  },
);
