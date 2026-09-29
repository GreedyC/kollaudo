# 5. CDEvents as an optional input and output

- Status: accepted
- Date: 2026-09-29

## Context

[CDEvents](https://cdevents.dev) is a CD Foundation specification for CI/CD events, built on
CloudEvents. It covers artifacts, deployments, environments and test runs, which match Kollaudo's
model. It is still 0.x, ecosystem adoption is limited, and neither Argo CD nor Kargo emits it natively.

Its test events only carry an outcome, not detailed results, so they can't replace CTRF.

## Decision

- Kollaudo accepts a small set of CDEvents as input, mainly `artifact.published` and
  `service.deployed`, plus test suite outcomes as summary data.
- Kollaudo emits CDEvents as output for its own results, such as a verdict or a completed test run,
  so other tools can react to them.
- CDEvents support comes after the CLI and the HTTP API. The core never depends on it.

## Consequences

- Tools that already emit CDEvents work without a dedicated recipe.
- Kollaudo can take part in CDEvents-based pipelines as both a consumer and a producer.
- Only the events Kollaudo needs are mapped, which limits the impact of spec changes.
