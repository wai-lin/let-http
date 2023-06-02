import { EnvSchema } from 'src/env';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvSchema {}
	}
}
