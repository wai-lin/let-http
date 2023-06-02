import { z } from 'zod';

export type ZodTypeName =
	| 'ZodArray'
	| 'ZodArray'
	| 'ZodObject'
	| 'ZodString'
	| 'ZodString'
	| 'ZodNull'
	| 'ZodUndefined'
	| 'ZodBoolean'
	| 'ZodBigInt'
	| 'ZodDate'
	| 'ZodAny'
	| 'ZodUnknown'
	| 'ZodNever'
	| 'ZodSymbol'
	| 'ZodNaN'
	| 'ZodEnum'
	| 'ZodOptional';

/**
 * Validate given value with zod schema.
 * @param schema Zod Schema
 * @param data Value to validate
 * @returns `[parsed_data, error]`
 */
export function validateZod<TData = unknown>(
	schema: z.ZodSchema<TData>,
	data: unknown,
) {
	const parsed = schema.safeParse(data);
	if (!parsed.success) return [null, parsed.error] as const;
	return [parsed.data, null] as const;
}

/**
 * Process zod flatten error to one single string array of messages.
 */
export function zodFlattenErrors<
	TValidationResult extends ReturnType<typeof validateZod>,
>(validated: TValidationResult) {
	const [, error] = validated;
	if (!error) return [];

	const flatten = error.flatten();
	const mergedErrors = [...flatten.formErrors];
	for (const key in flatten.fieldErrors) {
		let errors = (flatten.fieldErrors as any)[key] as string[];
		errors = errors.map((e) => `${key}}}${e}`);
		mergedErrors.push(...errors);
	}
	return mergedErrors;
}

/**
 * Get the single error message from flatten result.
 * @param validated Return type of `validateZod` function
 * @returns single string error message or `null`
 */
export function getZodFlattenSingleError<
	TValidationResult extends ReturnType<typeof validateZod>,
>(validated: TValidationResult) {
	return zodFlattenErrors(validated)[0];
}

/**
 * Get Zod TypeName enum.
 * @param schema Zod schema instance
 * @returns {ZodTypeName} Zod Type Name
 */
export function getZodTypeName<TDataShape = object>(
	schema: z.ZodSchema<TDataShape>,
) {
	return schema.constructor.name as ZodTypeName;
}

/**
 * Check if Schema is Zod TypeName.
 * @param schema Zod Schema instance
 * @param typeName TypeName to check.
 * @returns {boolean}
 */
export function isZodTypeName<TDataShape = object>(
	schema: z.ZodSchema<TDataShape>,
	typeName: ZodTypeName,
) {
	const schemaTypeName = schema.constructor.name as ZodTypeName;
	return typeName === schemaTypeName;
}
