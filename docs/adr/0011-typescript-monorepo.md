# 11. TypeScript monorepo

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo has a server, a web UI, a CLI and shared schemas (the internal model, CTRF validation, the
OpenAPI definition). They change together, and must stay consistent.

Most cloud-native delivery tools that Kollaudo works with (Kubernetes, Argo CD, Kargo, Flux) are
written in Go, which offers single static binaries, small container images and contributors familiar
with that ecosystem. Kollaudo's workload, on the other hand, is light: it receives reports and events,
stores them and answers queries. And its web UI is written in TypeScript whatever the server language.

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

TypeScript is preferred to Go because:

- **One language for everything**: the shared schemas give request validation, types for the UI and
  the CLI, and the OpenAPI document ([0012](0012-server-stack.md)). With a Go server, schemas and
  types would be maintained twice.
- **The test-reporting ecosystem is JavaScript-first**: the main CTRF reporters (Playwright, Jest,
  Vitest, Cypress) and most of their authors are in TypeScript.
- **Performance is not a constraint** for this workload.
- **Maintainer velocity**: the project is started by a single maintainer whose main language is
  TypeScript, and delivering a useful v0.1 matters more than any runtime advantage.

Go's advantages are covered in other ways. The CLI is also published as standalone executables
(Node.js single executable applications) for CI environments without Node.js, and anything that can
send an HTTP request can call the API directly ([0010](0010-self-hosted-api-first.md)). Recipes are
mostly YAML and configuration, so they don't depend on the core's language.

## Consequences

- Types are shared between the API, the CLI and the UI, so a breaking change shows up at compile time.
- One pull request can change the API and all its consumers together.
- One language for the whole project lowers the barrier for contributors.
- Recipes that need another language (for example YAML templates) live in their own folders or repositories.
- The container image is larger than a Go binary would be, which is acceptable for a self-hosted service.
- The CLI is only an HTTP client of the public API, so it could be rewritten in Go on its own, if
  standalone Node.js executables prove insufficient.
