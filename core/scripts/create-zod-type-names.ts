import path from 'node:path';
import fs from 'node:fs';
import z from 'zod';

const typeNames = {
	testArray: z.array(z.any()).constructor.name,
	array: z.array(z.any())._def.typeName,
	object: z.object({})._def.typeName,
	string: z.string()._def.typeName,
	number: z.string()._def.typeName,
	null: z.null()._def.typeName,
	undefined: z.undefined()._def.typeName,
	boolean: z.boolean()._def.typeName,
	bigint: z.bigint()._def.typeName,
	date: z.date()._def.typeName,
	any: z.any()._def.typeName,
	unknown: z.unknown()._def.typeName,
	never: z.never()._def.typeName,
	symbol: z.symbol()._def.typeName,
	nan: z.nan()._def.typeName,
	enum: z.enum(['1', '2'])._def.typeName,
	optional: z.optional(z.string())._def.typeName,
};
type TypeNames = typeof typeNames;
type TypeName = keyof TypeNames;

let typeNamesEnum: string[] = [];
for (const key in typeNames) {
	const value = typeNames[key as unknown as TypeName];
	typeNamesEnum.push(`"${value}"`);
}

let generatedType = `import 'zod';

declare module 'zod' {
	export type ZodTypeName =
		| ${typeNamesEnum.join('\n\t\t| ')}
}
`;

const filePath = path.resolve(__dirname, '../types/zod.d.ts');

console.log(`Generating ${filePath} ...`);
fs.writeFileSync(filePath, generatedType);
