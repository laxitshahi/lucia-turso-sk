import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable(
	'user',
	{
		id: text('id').unique().notNull(),
		provider: text('provider', { enum: ['google', 'github'] }),
		providerId: text('provider_id').notNull(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		isAdmin: integer('is_admin').notNull(),
		email: text('email').unique()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.provider, table.providerId] })
		};
	}
);

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer('expires_at').notNull()
});

export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;

export type InsertSession = typeof sessionTable.$inferInsert;
export type SelectSession = typeof sessionTable.$inferSelect;
