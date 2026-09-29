# 2. Kollaudo judges, it never orchestrates

- Status: accepted
- Date: 2026-09-29

## Context

Many mature tools already build code (CI systems), run tests (test frameworks, Testkube), deploy
(Argo CD, Flux, Helm) and promote releases (Kargo, pipelines). What is missing is a single,
tool-independent answer to *"is this version, in this environment, healthy?"*.

[Keptn](https://keptn.sh), a CNCF project with the same goal of quality gates for promotions, was
archived in September 2025. It took charge of the delivery lifecycle and required SLIs and SLOs
defined up front, which made it heavy to adopt, and it depended on a single company that stepped back.

## Decision

Kollaudo observes and judges. It never builds, runs tests, deploys or promotes:

- it **collects** results from the tools that do the work (see [0006](0006-push-based-ingest.md));
- it **links** them to versions and environments;
- it **judges**, and exposes its verdict to whatever tool performs the promotion.

Adopting Kollaudo must not require changing how a team builds, tests or deploys. Sending data should
be one extra command or one webhook.

## Consequences

- Kollaudo can be added to an existing pipeline, and removed from it, without disrupting delivery.
- If Kollaudo is unavailable, delivery keeps working. Only gates that call it are affected, and
  recipes should make their failure behavior explicit.
- Features that would make Kollaudo run things (triggering test suites, retrying deployments) are out
  of scope for the core. They can exist as separate tools or recipes.
