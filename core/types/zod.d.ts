import 'zod';

declare module 'zod' {
	export type ZodTypeName =
		| "ZodArray"
		| "ZodArray"
		| "ZodObject"
		| "ZodString"
		| "ZodString"
		| "ZodNull"
		| "ZodUndefined"
		| "ZodBoolean"
		| "ZodBigInt"
		| "ZodDate"
		| "ZodAny"
		| "ZodUnknown"
		| "ZodNever"
		| "ZodSymbol"
		| "ZodNaN"
		| "ZodEnum"
		| "ZodOptional"
}
