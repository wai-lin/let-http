import KoaRouter from 'koa-router';
import { Router } from 'let-http/router';

const koaRouter = new KoaRouter();
export const router = new Router(koaRouter);
