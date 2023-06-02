import z from 'zod';
import { router } from 'src/router';
import { userSchema } from './users.schemas';
import { UsersService } from './users.service';

export const usersPath = router.path('/users');
export const usersDetailPath = usersPath.path('/:id', {
	params: z.object({ id: z.string() }),
});

usersDetailPath.get({
	input: { query: z.object({ page: z.string() }) },
	response: { '200': z.string() },
	handler(ctx) {
		return {
			'200': { body: ctx.input.id },
		};
	},
});

usersPath.get({
	response: { '200': z.object({ users: z.array(userSchema) }) },
	handler() {
		const users = UsersService.list();
		return {
			'200': { body: { users } },
		};
	},
});

usersPath.post({
	input: { body: userSchema },
	response: { '200': userSchema },
	handler(ctx) {
		const user = UsersService.create(ctx.input);
		if (!user) throw new Error('Cannot add user.');
		return { '200': { body: user } };
	},
});
