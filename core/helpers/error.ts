import { httpStatusCodes, HttpStatusCodes } from '../utils/http';

type ErrorInstance = Error & {
	status: keyof HttpStatusCodes;
	expose: boolean;
};

/**
 * Expose error to koa default handler to response with.
 * @param message Error message to response with.
 * @param status (optional | _default: 500 Internal Server Error_) Status code in message form to response with. This will convert to statusCode number internally.
 */
export function httpError(
	message: string,
	status: HttpStatusCodes[keyof HttpStatusCodes] = 'Internal Server Error',
) {
	let statusCode: keyof HttpStatusCodes = getStatusCode(status);

	const err = new Error(message) as ErrorInstance;
	err.status = Number(statusCode) as keyof HttpStatusCodes;
	err.expose = true;
	throw err;
}

/**
 * Get the `statusCode` number back from the provided `statusMessage`.
 */
export function getStatusCode(
	statusMessage: HttpStatusCodes[keyof HttpStatusCodes],
	fallback: keyof HttpStatusCodes = 500,
) {
	let statusCode: keyof HttpStatusCodes = fallback;

	for (let key in httpStatusCodes) {
		const value = httpStatusCodes[key as unknown as keyof HttpStatusCodes];
		if (value === statusMessage)
			statusCode = key as unknown as keyof HttpStatusCodes;
	}

	return Number(statusCode) as keyof HttpStatusCodes;
}
