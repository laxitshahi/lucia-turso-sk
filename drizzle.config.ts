import 'dotenv/config';
import type { Config } from 'drizzle-kit';
export default {
	schema: './src/lib/server/schema.ts',
	out: './migrations',
	driver: 'turso',
	dbCredentials: {
		url: process.env.DB_CONNECTION_URL!,
		authToken: process.env.AUTH_TOKEN!
	}
} satisfies Config;
