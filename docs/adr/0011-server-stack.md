# 11. Server stack: Node.js, Hono, Zod and Drizzle

- Status: accepted
- Date: 2026-09-29

## Context

[0009](0009-typescript-monorepo.md) chose TypeScript. The server still needs a runtime, an HTTP
framework, a validation library and a database layer. [0007](0007-self-hosted-api-first.md) requires
the API to be documented with OpenAPI, and the same schemas must be shared with the CLI and the UI.

## Decision

- **Runtime**: Node.js, active LTS only.
- **HTTP framework**: [Hono](https://hono.dev), running on `@hono/node-server`. It is small, built on
  web standards and fully typed.
- **Validation and OpenAPI**: [Zod](https://zod.dev) schemas in `packages/schema`, with
  `@hono/zod-openapi` generating the OpenAPI document from the same schemas that validate requests.
- **Database**: [Drizzle ORM](https://orm.drizzle.team) for queries, `drizzle-kit` for versioned SQL
  migrations, applied automatically when the server starts.
- **UI**: React, built with Vite and served as static files by the server.
- **Tests**: Vitest across the monorepo. Database tests run against a real PostgreSQL.

## Consequences

- One schema definition gives request validation, TypeScript types and the OpenAPI document, so they
  can't drift apart.
- Drizzle stays close to SQL, which keeps the verdict queries readable, and its migrations are plain
  SQL files that can be reviewed.
- Hono is younger than Express or Fastify. It is kept behind the route layer, so replacing it would
  not touch the domain code.
