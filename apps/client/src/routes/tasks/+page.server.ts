import { error } from '@sveltejs/kit';

import { API_URL } from '$env/static/private';

export async function load({ fetch, params }) {
	const res = await fetch(`${API_URL}/tasks`);

	if (!res.ok) throw error(500, 'Failed to fetch posts');

	return { tasks: await res.json() };
}
