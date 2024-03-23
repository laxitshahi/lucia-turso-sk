import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	return {
		firstName: event.locals.user.firstName,
		lastName: event.locals.user.lastName
	};
};

export const actions: Actions = {
	signOut: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/login');
	}
} satisfies Actions;
