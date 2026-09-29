# 8. PostgreSQL as the database

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo's data is strongly relational: versions have deployments and test runs, test runs have test
results, and the verdict is computed by joining them. It must also be easy to self-host.

## Decision

PostgreSQL is the only supported database. Flexible, format-specific data (for example CTRF `extra`
fields) is stored in `jsonb` columns.

## Consequences

- Joins, constraints and transactions come for free.
- PostgreSQL is available everywhere: managed cloud services, Helm charts, Docker.
- Teams that only run other databases need to add PostgreSQL.
- Supporting a single database keeps migrations and testing simple.
