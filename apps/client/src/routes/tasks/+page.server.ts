/**
 * Server-side data loader for the `/tasks` route.
 *
 * Fetches all tasks from the NestJS backend and passes them to the
 * Svelte page component as `data.tasks`. This runs on the server only
 * so the `API_URL` env var stays private.
 */

import type { TasksOverlayResponse } from '@mrmittens/shared';
import { error } from '@sveltejs/kit';

import { API_URL } from '$env/static/private';

export async function load({ fetch }) {
	// This runs server-side, so the private API URL stays private instead of becoming
	// "public knowledge" in the same way your Wi-Fi password should not be public knowledge.
	const res = await fetch(`${API_URL}/tasks`);

	if (!res.ok) throw error(502, 'Failed to fetch tasks from the server');

	const overlay = (await res.json()) as TasksOverlayResponse;

	return { overlay };
}
