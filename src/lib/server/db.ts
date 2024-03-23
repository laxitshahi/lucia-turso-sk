import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
	url: process.env.DB_CONNECTION_URL!,
	authToken: process.env.AUTH_TOKEN!
});

export const db = drizzle(client, { schema });
