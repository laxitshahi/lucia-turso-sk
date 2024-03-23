import 'dotenv/config';
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { db } from './db';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessionTable, userTable } from './schema';
import { GitHub, Google } from 'arctic';

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID || '',
	process.env.GITHUB_CLIENT_SECRET || ''
);

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID || '',
	process.env.GOOGLE_CLIENT_SECRET || '',
	process.env.GOOGLE_LOCAL_REDIRECT_URI || ''
);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (data) => {
		return {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			isAdmin: data.isAdmin
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	firstName: string;
	lastName: string;
	email: string | null;
	isAdmin: number;
}
