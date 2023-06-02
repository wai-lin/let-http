import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import z from 'zod';

const environment = process.env.NODE_ENV;
const projectRoot = path.resolve(__dirname, '../../');
const resolveEnvFile = (filename: string) =>
	path.resolve(projectRoot, filename);

// .env file names with ranking
const envFiles = [
	'.env',
	'.env.local',
	'.env.{NODE_ENV}',
	'.env.{NODE_ENV}.local',
]
	// create .env file names with NODE_ENV
	.map((envFile) => {
		if (!environment) return envFile;
		return envFile.replace('{NODE_ENV}', environment.toLowerCase());
	})
	// remove environment specific file names if not exists
	.filter((envFile) => {
		if (environment) return true;
		return envFile.includes('{NODE_ENV}') ? false : true;
	});

// read each .env file and parse them.
const envFileContents = envFiles.map((envFile) => {
	const filePath = resolveEnvFile(envFile);
	if (fs.existsSync(filePath)) {
		const file = fs.readFileSync(filePath);
		const envRaw = dotenv.parse(file);
		return envRaw;
	}
	return {};
});

// merge each .env file via ranking
const unparsedEnv = envFileContents.reduce(
	(curr, next) => ({ ...curr, ...next }),
	process.env,
);

const errorMessage = `
==========================================================================
Cannot execute application. Failed to parse environment variables.
==========================================================================

* Check whether \`.env\` exists or not.
* Check whether environment variables are correct or not.
`;
export function loadDotEnv<TShape extends object = object>(
	envSchema: z.ZodSchema<TShape>,
) {
	const parsedEnv = envSchema.safeParse(unparsedEnv);

	if (parsedEnv.success === false) {
		const flatten = parsedEnv.error.flatten();
		const mergedErrors = [...flatten.formErrors];
		for (const key in flatten.fieldErrors) {
			const errors = `${key}: ${(flatten.fieldErrors as any)[key]}`;
			mergedErrors.push(errors);
		}

		console.error(errorMessage);
		console.error(JSON.stringify(mergedErrors, null, 2));
		return process.exit(1);
	}

	process.env = { ...process.env, ...parsedEnv.data };
}
