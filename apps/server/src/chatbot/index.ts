import { createBotCommand } from '@twurple/easy-bot';

import { createTask, createUser, getUser } from '../db';

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

export const task = createBotCommand(
  'task',
  async (params, { userId, userName, userDisplayName, say }) => {
    let user = await getUser(userId);
    if (!user) {
      user = await createUser(userId, userName, userDisplayName);
    }
    const taskText = params.join(' ');
    if (!!user) {
      createTask(user.id, taskText);
    }
  },
);
