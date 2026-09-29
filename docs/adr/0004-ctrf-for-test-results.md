# 4. CTRF as the native format for test results

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo must accept test results from any framework and any CI. Writing an adapter per framework
doesn't scale.

[CTRF](https://ctrf.io) (Common Test Report Format) is an open JSON format for test results, with
reporters for Playwright, Jest, Vitest, Cypress, Pytest, JUnit and many others. It models what
Kollaudo needs: a flat list of tests with suite, file and tags; retries and flaky tests; attachments;
stable test ids; build and commit information; and namespaced `extra` fields for extensions.

JUnit XML is older and less rich, but almost every tool can produce it.

## Decision

- CTRF is the native ingest format for test results.
- JUnit XML is also accepted and converted to CTRF on ingest.
- Kollaudo-specific data (component, version, environment) is passed as CLI or API parameters, or in
  CTRF `extra` fields under the `kollaudo` namespace.

## Consequences

- Most frameworks already work, through an existing CTRF reporter or through JUnit XML.
- CTRF is pre-1.0 and maintained by a small team. Because of [0003](0003-own-internal-model.md), a spec
  change only affects the CTRF adapter.
- The CTRF and JUnit adapters need tests against real reports from several frameworks.
