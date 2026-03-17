/**
 * Server-side data loader for the `/tasks` route.
 *
 * Fetches all tasks from the NestJS backend and passes them to the
 * Svelte page component as `data.tasks`. This runs on the server only
 * so the `API_URL` env var stays private.
 */

import { error } from '@sveltejs/kit';

import { API_URL } from '$env/static/private';

export async function load({ fetch }) {
	const res = await fetch(`${API_URL}/tasks`);

	if (!res.ok) throw error(500, 'Failed to fetch tasks');

	return { tasks: await res.json() };
}
