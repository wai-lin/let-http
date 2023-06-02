import KoaApp from 'koa';
import KoaRouter from 'koa-router';
import { koaBody } from 'koa-body';
import z from 'zod';
import { BaseContext } from 'koa';
import { HttpStatusCodes } from '../utils/http';
import { validateZod } from '../helpers/zod';
import { httpError } from '../helpers/error';
import { getZodFlattenSingleError } from '../helpers/zod';

// ==============================
// #region RoutePath
// ==============================
export type RouteMethodResponse = {
	[K in keyof HttpStatusCodes]?: z.ZodType;
};

export type HandlerReturnType<ResponseSchemas extends RouteMethodResponse> = {
	[K in keyof ResponseSchemas]?: ResponseSchemas[K] extends z.ZodType
		? {
				headers?: Record<string, unknown>;
				body: NonNullable<z.infer<ResponseSchemas[K]>>;
		  }
		: never;
};

export type HandlerFn<
	TParams extends object,
	TQuery extends object,
	TBody extends object,
	TResponse extends RouteMethodResponse,
> = (
	ctx: BaseContext & {
		input: TParams & TQuery & TBody;
		body: never;
	},
) => HandlerReturnType<TResponse> | Promise<HandlerReturnType<TResponse>>;

export interface RouteMethodArgs<
	TMeta extends object = object,
	TParams extends object = object,
	TQuery extends object = object,
	TBody extends object = object,
	TResponse extends RouteMethodResponse = RouteMethodResponse,
	TOmitBody extends 'omitInputBody' | false = false,
> {
	description?: string;
	meta?: TMeta;
	beforeEnter?: Function;
	beforeLeave?: Function;
	input?: TOmitBody extends 'omitInputBody'
		? { query?: z.ZodSchema<TQuery> }
		: { query?: z.ZodSchema<TQuery>; body?: z.ZodSchema<TBody> };
	response: TResponse;
	handler: HandlerFn<TParams, TQuery, TBody, TResponse>;
}

export interface RoutePathDef<TPath, TParams extends object = object> {
	path: TPath;
	params?: z.ZodSchema<TParams>;
	get?: RouteMethodArgs<
		object,
		TParams,
		object,
		object,
		RouteMethodResponse,
		'omitInputBody'
	>;
	post?: RouteMethodArgs<
		object,
		TParams,
		object,
		object,
		RouteMethodResponse
	>;
	patch?: RouteMethodArgs<
		object,
		TParams,
		object,
		object,
		RouteMethodResponse
	>;
	put?: RouteMethodArgs<object, TParams, object, object, RouteMethodResponse>;
	delete?: RouteMethodArgs<
		object,
		TParams,
		object,
		object,
		RouteMethodResponse,
		'omitInputBody'
	>;
}

export interface RoutePathOptions<TParams extends object = object> {
	params?: z.ZodSchema<TParams>;
}

export class RoutePath<const TPath, TParams extends object = object> {
	_def: RoutePathDef<TPath, TParams> = { path: '' as TPath };

	constructor(path: TPath, options?: RoutePathOptions<TParams>) {
		this._def.path = path;
		this._def.params = options?.params;
	}

	get url() {
		return this._def.path;
	}

	path<const TSubPath, TSubParams extends object = object>(
		path: TSubPath,
		options?: RoutePathOptions<TSubParams>,
	) {
		// @ts-expect-error this is necessary, I don't know the other solutions as of yet and this is working.
		type SubPath = `${TPath}${TSubPath}`;
		const subPath = `${this._def.path}${path}` as SubPath;
		return new RoutePath<SubPath, TSubParams>(subPath, options);
	}

	get<
		TMeta extends object,
		TQuery extends object,
		TBody extends object,
		TResponse extends RouteMethodResponse,
	>(
		args: RouteMethodArgs<
			TMeta,
			TParams,
			TQuery,
			TBody,
			TResponse,
			'omitInputBody'
		>,
	) {
		this._def.get = args as any;
		return this;
	}

	post<
		TMeta extends object,
		TQuery extends object,
		TBody extends object,
		TResponse extends RouteMethodResponse,
	>(args: RouteMethodArgs<TMeta, TParams, TQuery, TBody, TResponse>) {
		this._def.post = args as any;
		return this;
	}

	patch<
		TMeta extends object,
		TQuery extends object,
		TBody extends object,
		TResponse extends RouteMethodResponse,
	>(args: RouteMethodArgs<TMeta, TParams, TQuery, TBody, TResponse>) {
		this._def.patch = args as any;
		return this;
	}

	put<
		TMeta extends object,
		TQuery extends object,
		TBody extends object,
		TResponse extends RouteMethodResponse,
	>(args: RouteMethodArgs<TMeta, TParams, TQuery, TBody, TResponse>) {
		this._def.put = args as any;
		return this;
	}

	delete<
		TMeta extends object,
		TQuery extends object,
		TBody extends object,
		TResponse extends RouteMethodResponse,
	>(args: RouteMethodArgs<TMeta, TParams, TQuery, TBody, TResponse>) {
		this._def.delete = args as any;
		return this;
	}
}
// ==============================
// #endregion
// ==============================

// ==============================
// #region RouteHandlerGenerator
// ==============================
function handlerGenerator<
	TDef extends RoutePathDef<string>,
	TDefKey extends 'get' | 'post' | 'put' | 'patch' | 'delete',
>(routeDef: TDef, routeFor: TDefKey) {
	const handler: KoaRouter.IMiddleware = async (ctx, next) => {
		const t1 = performance.now();

		const defHandler = routeDef[routeFor];

		if (!defHandler) return;

		if (defHandler.beforeEnter) defHandler.beforeEnter();

		const input = {
			...ctx.params,
			...ctx.request.query,
			...ctx.request.body,
		};

		const inputParamsSchema = routeDef.params;
		const inputQuerySchema = (defHandler.input as any)?.query;
		const inputBodySchema = (defHandler.input as any)?.body;

		const objSchema = z.object({});
		const inputSchema = objSchema
			.merge((inputParamsSchema as any) ?? objSchema)
			.merge((inputQuerySchema as any) ?? objSchema)
			.merge((inputBodySchema as any) ?? objSchema);
		const [validateData, validateError] = validateZod(inputSchema, input);

		if (validateError) {
			const firstError = getZodFlattenSingleError([null, validateError]);
			const errorMessage = firstError ?? 'Validation error!';
			throw httpError(errorMessage, 'Bad Request');
		}

		const context = { ...ctx, input: validateData } as any;
		const result = await defHandler.handler(context);

		if (defHandler.beforeLeave) defHandler.beforeLeave();

		Object.keys(defHandler.response).forEach((key) => {
			const statusCodeKey = key as unknown as keyof HttpStatusCodes;
			const response = result[statusCodeKey] as unknown as {
				headers: Record<string, any>;
				body: any;
			};
			if (!response) return;

			const statusCode = Number(statusCodeKey);

			ctx.response.status = Number(statusCode);
			if (response.headers) ctx.response.set(response.headers);
			ctx.response.body = response.body;
			console.log(ctx.response.headers);
		});

		const t2 = performance.now();

		const timeTaken = t2 - t1;
		console.log(
			`[${routeFor}] : ${routeDef.path} : time take to response ${timeTaken} ms.`,
		);

		await next();
	};
	return [routeDef.path, handler] as const;
}
// ==============================
// #endregion
// ==============================

// ==============================
// #region Router
// ==============================
export type RouterMiddlewareFn = KoaRouter.IMiddleware;

export class Router {
	private koaRouter: KoaRouter;
	_paths: RoutePath<string>[] = [];
	_beforeEach: RouterMiddlewareFn[] = [];
	_afterEach: RouterMiddlewareFn[] = [];

	constructor(koaRouter: KoaRouter) {
		this.koaRouter = koaRouter;
	}

	path<const TPath, TParams extends object = object>(
		url: TPath,
		options?: RoutePathOptions<TParams>,
	) {
		const pathInstance = new RoutePath(url, options);
		this._paths.push(pathInstance as any);
		return pathInstance;
	}

	beforeEach(...middlewares: RouterMiddlewareFn[]) {
		this._beforeEach.push(...middlewares);
	}

	afterEach(...middlewares: RouterMiddlewareFn[]) {
		this._afterEach.push(...middlewares);
	}

	register(...routePaths: RoutePath<any, any>[]) {
		this._paths.push(...routePaths);
	}

	setup(app: KoaApp) {
		app.use(koaBody());

		this.koaRouter.use(...this._beforeEach);

		// setup route functions from _paths
		this._paths.forEach(({ _def }) => {
			// this.koaRouter.prefix(_def.path); // set path url
			if (_def.get) {
				this.koaRouter.get(...handlerGenerator(_def, 'get'));
			}
			if (_def.post) {
				this.koaRouter.post(...handlerGenerator(_def, 'post'));
			}
			if (_def.put) {
				this.koaRouter.put(...handlerGenerator(_def, 'put'));
			}
			if (_def.patch) {
				this.koaRouter.patch(...handlerGenerator(_def, 'patch'));
			}
			if (_def.delete) {
				this.koaRouter.delete(...handlerGenerator(_def, 'delete'));
			}
		});

		this.koaRouter.use(...this._afterEach);

		app.use(this.koaRouter.routes());

		return app;
	}
}
// ==============================
// #endregion
// ==============================
