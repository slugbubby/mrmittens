import type {
  DbTaskWithUserRecord,
  TaskOverlayGroup,
  TaskOverlayItem,
  TasksOverlayResponse,
} from '@mrmittens/shared';

// The frontend should not care that the database thinks in Date objects and relationship graphs.
// It wants neat JSON. We provide neat JSON. Civilization persists for another day.
const toOverlayItem = (
  task: DbTaskWithUserRecord,
  displayNumber: number,
): TaskOverlayItem => ({
  displayNumber,
  id: task.id,
  text: task.text,
  createdAt: task.createdAt.toISOString(),
  user: {
    id: task.user.id,
    displayName: task.user.displayName,
    twitchUsername: task.user.twitchUsername,
  },
});

export const buildTasksOverlayResponse = (
  tasks: DbTaskWithUserRecord[],
): TasksOverlayResponse => {
  // Number tasks globally first so `!done 4` means the same thing in chat and on the overlay.
  const overlayTasks = tasks.map((task, index) => toOverlayItem(task, index + 1));
  const groupsByUserId = new Map<string, TaskOverlayGroup>();

  for (const task of overlayTasks) {
    // Grouping is only for presentation. The numbering above remains global on purpose.
    const existingGroup = groupsByUserId.get(task.user.id);
    if (existingGroup) {
      existingGroup.tasks.push(task);
      continue;
    }

    groupsByUserId.set(task.user.id, {
      user: task.user,
      tasks: [task],
    });
  }

  return {
    tasks: overlayTasks,
    groups: Array.from(groupsByUserId.values()),
    updatedAt: new Date().toISOString(),
  };
};
