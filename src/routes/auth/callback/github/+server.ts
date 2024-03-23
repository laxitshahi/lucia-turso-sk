// routes/login/github/callback/+server.ts
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { github, lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';

import type { RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { userTable } from '$lib/server/schema';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;

	// We want to ensure that we are getting all 3 params
	// AND that the cookie for github_oauth_state is equal to the state that we get from the search param
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);

		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser: GitHubUser = await githubUserResponse.json();

		// This returns as array, firstFirst returns an object
		const existingUser: any = await db
			.select()
			.from(userTable)
			.where(and(eq(userTable.provider, 'github'), eq(userTable.providerId, String(githubUser.id))))
			.limit(1);

		if (existingUser.length) {
			const session = await lucia.createSession(existingUser[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(15);

			const userValues = {
				id: String(userId),
				provider: 'github' as 'github',
				providerId: String(githubUser.id),
				firstName: githubUser.name.split(' ', 2)[0],
				lastName: githubUser.name.split(' ', 2)[1],
				isAdmin: 0,
				email: githubUser.email
			};
			// Replace this with your own DB client.
			await db.insert(userTable).values(userValues);

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

interface GitHubUser {
	id: string;
	name: string;
	email: string | null;
	login: string;
}
