# Architecture Decision Records

Each file records one decision: its context, the decision itself and its consequences.
A decision is never edited once accepted. If it changes, a new ADR supersedes it.

| # | Decision | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | accepted |
| [0002](0002-tool-agnostic-core.md) | Tool-agnostic core | accepted |
| [0003](0003-own-internal-model.md) | Own internal data model | accepted |
| [0004](0004-ctrf-for-test-results.md) | CTRF as the native format for test results | accepted |
| [0005](0005-cdevents-in-and-out.md) | CDEvents as an optional input and output | accepted |
| [0006](0006-push-based-ingest.md) | Push-based ingest | accepted |
| [0007](0007-self-hosted-api-first.md) | Self-hosted and API-first | accepted |
| [0008](0008-postgresql.md) | PostgreSQL as the database | accepted |
| [0009](0009-typescript-monorepo.md) | TypeScript monorepo | accepted |
| [0010](0010-judge-never-orchestrate.md) | Kollaudo judges, it never orchestrates | accepted |
| [0011](0011-server-stack.md) | Server stack: Node.js, Hono, Zod and Drizzle | accepted |
| [0012](0012-create-on-first-use.md) | Components, environments and versions are created on first use | accepted |

## Template

```markdown
# N. Title

- Status: proposed | accepted | superseded by [NNNN](NNNN-title.md)
- Date: YYYY-MM-DD

## Context
## Decision
## Consequences
```
