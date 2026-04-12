import { error } from '@sveltejs/kit';

import { API_URL } from '$env/static/private';
import { fetchTasks } from '@mrmittens/server/tasks';

type Tasks = Awaited<ReturnType<typeof fetchTasks>>;

export async function load({ fetch, params }) {
	const res = await fetch(`${API_URL}/tasks`);

	if (!res.ok) throw error(500, 'Failed to fetch posts');

	const tasks: Tasks = await res.json();
	// TODO generate drizzle types for shared usage
	const tasksByUser = Object.groupBy(tasks, (task) => task.user.displayName);

	return { tasksByUser };
}
