# 9. TypeScript monorepo

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo has a server, a web UI, a CLI and shared schemas (the internal model, CTRF validation, the
OpenAPI definition). They change together, and must stay consistent.

## Decision

Kollaudo is a single TypeScript monorepo managed with pnpm workspaces:

```
apps/server/      HTTP API /v1, also serves the UI
apps/web/         React UI
packages/cli/     @kollaudo/cli
packages/schema/  shared types, validation and OpenAPI
deploy/           Docker Compose, later Helm
docs/adr/         these records
```

## Consequences

- Types are shared between the API, the CLI and the UI, so a breaking change shows up at compile time.
- One pull request can change the API and all its consumers together.
- One language for the whole project lowers the barrier for contributors.
- Recipes that need another language (for example YAML templates) live in their own folders or repositories.
