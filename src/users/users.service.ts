import { db } from '../lib/database';
import { UserSchema } from './users.schemas';

const usersTbl = db.get('users');

export const UsersService = {
	create(payload: UserSchema) {
		if (!usersTbl) throw new Error('Users table not found.');
		const user = usersTbl.set(payload.id, payload).get(payload.id);
		return user;
	},

	list() {
		if (!usersTbl) throw new Error('Users table not found.');
		const usersEntries = Object.fromEntries(usersTbl.entries());

		const users: UserSchema[] = Object.keys(usersEntries).map(
			(key) => usersEntries[key],
		);
		return users;
	},
};
