import { loadDotEnv } from '@/core/lib/env';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'staging']),
});

export type EnvSchema = z.infer<typeof envSchema>;
loadDotEnv(envSchema);
