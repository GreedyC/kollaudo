# 12. Server stack: Node.js, Hono, Zod, Drizzle and PostgreSQL

- Status: accepted
- Date: 2026-09-29

## Context

[0011](0011-typescript-monorepo.md) chose TypeScript. The server still needs a runtime, an HTTP
framework, a validation library, a database and a database layer.
[0010](0010-self-hosted-api-first.md) requires the API to be documented with OpenAPI, and the same
schemas must be shared with the CLI and the UI.

Kollaudo's data is strongly relational: versions have deployments and test runs, test runs have test
results, and the verdict is computed by joining them. The database must also be easy to self-host.

## Decision

- **Runtime**: Node.js, active LTS only.
- **HTTP framework**: [Hono](https://hono.dev), running on `@hono/node-server`. It is small, built on
  web standards and fully typed.
- **Validation and OpenAPI**: [Zod](https://zod.dev) schemas in `packages/schema`, with
  `@hono/zod-openapi` generating the OpenAPI document from the same schemas that validate requests.
- **Database**: PostgreSQL is the only supported database. Flexible, format-specific data (for
  example CTRF `extra` fields) is stored in `jsonb` columns.
- **Database layer**: [Drizzle ORM](https://orm.drizzle.team) for queries, `drizzle-kit` for
  versioned SQL migrations, applied automatically when the server starts.
- **UI**: React, built with Vite and served as static files by the server.
- **Tests**: Vitest across the monorepo. Database tests run against a real PostgreSQL.

## Consequences

- One schema definition gives request validation, TypeScript types and the OpenAPI document, so they
  can't drift apart.
- Drizzle stays close to SQL, which keeps the verdict queries readable, and its migrations are plain
  SQL files that can be reviewed.
- PostgreSQL gives joins, constraints and transactions, and is available everywhere: managed cloud
  services, Helm charts, Docker. Teams that only run other databases need to add it, but supporting
  a single database keeps migrations and testing simple.
- Hono is younger than Express or Fastify. It is kept behind the route layer, so replacing it would
  not touch the domain code.
