# `/lib` Documentation

## Router

---

## Error Handling

---

## Environment Variables

### How we rank?

> Higher order number will override the others.

| Order | Environment file        |
| ----- | ----------------------- |
| 1.    | `.env`                  |
| 2.    | `.env.local`            |
| 3.    | `.env.{NODE_ENV}`       |
| 4.    | `.env.{NODE_ENV}.local` |

### `development`

1. `.env`
1. `.env.local`
1. `.env.development`
1. `.env.development.local`

### `production`

1. `.env`
1. `.env.local`
1. `.env.production`
1. `.env.production.local`

### `staging`

1. `.env`
1. `.env.local`
1. `.env.staging`
1. `.env.staging.local`

---
