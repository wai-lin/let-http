import fs from 'node:fs';
import path from 'node:path';
import { httpStatusCodes, HttpStatusCodes } from '../utils/http';

function generateHttpStatusCodeGenerics(typeName: string) {
	let statusCodes: Array<keyof HttpStatusCodes> = [];

	for (const key in httpStatusCodes) {
		statusCodes.push(key as unknown as keyof HttpStatusCodes);
	}

	const generics = statusCodes.map((c) => `\n\tT${c} = unknown`).join(',');
	const fields = statusCodes.map((c) => `\t\t${c}: T${c};`).join('\n');

	const type = `type ${typeName}<
	// #region Generics${generics}
	// #endregion
	> = {\n${fields}\n\t}`;
	return type;
}

const httpGenerics = `declare module 'http-generics' {
	export ${generateHttpStatusCodeGenerics('RouteMethodResponse')}
}`;

fs.writeFileSync(
	path.resolve(__dirname, '../types/http-generics.d.ts'),
	httpGenerics,
);
