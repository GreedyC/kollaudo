# 10. Self-hosted and API-first

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo stores sensitive data: test results, internal environment URLs, which versions run in
production. Many teams can't send that to a third-party service without a security review. Its
first users also run Kubernetes and routinely install tools with Helm.

Many organizations also want this kind of data in a place they already use, such as Backstage,
Grafana or an internal portal, rather than in yet another UI.

## Decision

- Kollaudo is self-hosted: one container (API and UI) plus PostgreSQL, installable with Docker Compose
  and, later, a Helm chart. There is no hosted service for now.
- Kollaudo is API-first: the HTTP API is versioned (`/v1`), documented with OpenAPI and treated as a
  public contract. The bundled UI uses only that public API.

## Consequences

- Teams keep their data, and can try Kollaudo with a single command.
- Anything the UI shows can also be built elsewhere, which makes integrations such as a Backstage
  plugin or a Grafana datasource possible.
- Every UI feature needs a public API first, which takes more work up front.
- A hosted offering can be added later without changing the architecture.
