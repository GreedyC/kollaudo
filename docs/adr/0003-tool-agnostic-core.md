# 3. Tool-agnostic core

- Status: accepted
- Date: 2026-09-29

## Context

Teams deliver software with very different tools: GitHub Actions, GitLab CI, Jenkins, Azure DevOps,
Argo CD, Flux, Kargo, Spinnaker, plain scripts. A tool that only works with one stack excludes
everyone else, and writing a dedicated integration for every tool doesn't scale.

## Decision

The core knows nothing about specific tools. It speaks only in generic concepts (component,
environment, version, deployment, test run, verdict) and receives data only through three generic
entry points:

- the `kollaudo` CLI;
- the HTTP API `/v1`;
- CDEvents (see [0009](0009-cdevents-in-and-out.md)).

Tool-specific support ships as **recipes**: configuration, templates or small adapters that turn a
tool's events into calls to those entry points (for example an Argo CD notification template, a Kargo
verification template, a GitHub Actions step). Recipes live outside the core.

The verdict is exposed the same way: an HTTP endpoint and a CLI command with a meaningful exit code,
so any promotion tool that can call a URL or run a command can use it as a gate.

## Consequences

- Any tool can work with Kollaudo from day one, through the CLI or the API.
- New tools are supported by adding recipes, which the community can contribute without touching the core.
- Proposals to add tool-specific logic to the core should be turned into a recipe instead.
- Some tool-specific richness, such as native Kargo Freight details, is only available as generic metadata.
