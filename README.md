# Let HTTP

> This is a framework with full support only for [`zod`](https://zod.dev/).

---

## Features

-   ʦ Fully TypeScript support
-   📚 No npm install framework, source code is always with you.
-   ✅ Typesafe api schemas and request handlers
-   🦺 Typesafe environment variables validator and loader
-   🎁 Typesafe database with [drizzle/orm](https://orm.drizzle.team/)
-   🛠 Utilities helpers right there to use
-   🏗️ Build to JavaScript only

## Utils Helpers

-   Rate Limiter
-   Socket
-   Basic Auth
-   Mailing
-   Queue

## Deployment

-   pm2
-   docker

---

## Middleware Lifecycle

1. koa
1. `router.beforeEach()` global
1. `beforeEnter()` per route
1. `handler()`
1. `beforeLeave()` per router
1. `router.afterEach()` global
1. koa

---

## Handler Lifecycle

1. `beforeEnter()`
1. `validateZod()`
1. `handler()`
1. `beforeLeave()`
1. `response`
