import z from 'zod';

export const userSchema = z.object({
	id: z.string().regex(/^\d*$/).min(1),
	name: z.string().min(1),
	age: z.number().min(1),
});
export type UserSchema = z.infer<typeof userSchema>;
