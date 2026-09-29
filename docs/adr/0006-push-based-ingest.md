# 6. Push-based ingest

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo could get its data in two ways: by polling other tools' APIs (pull), or by letting those
tools send data to it (push). Pulling requires read credentials for every CI, code-quality and
deployment tool, one client per tool, and polling delays.

## Decision

Kollaudo is push-based. CI jobs, delivery tools and test reporters send data to Kollaudo through
the CLI, the HTTP API or CDEvents. Kollaudo never calls other tools to fetch data.

Senders authenticate with API tokens scoped to a project.

## Consequences

- Kollaudo holds no credentials to third-party systems, which keeps its security surface small.
- Data arrives as soon as it's produced.
- History starts when a team starts sending data. There is no backfill from existing tools.
- Kollaudo must be reachable from where data is sent, such as CI runners and clusters.
