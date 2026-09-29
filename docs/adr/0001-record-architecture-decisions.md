# 1. Record architecture decisions

- Status: accepted
- Date: 2026-09-29

## Context

Kollaudo is an open-source project that will be read and extended by people who weren't there when
its design was decided. Without a record, the same questions get asked, and settled, again and again.

## Decision

Architecture decisions are recorded as short Markdown files in `docs/adr/`, numbered in order, using
the template in [`README.md`](README.md).

Until v0.1 is released, ADRs are drafts: they can be edited freely as the design settles, and git
history keeps track of the changes. From v0.1 on, an accepted ADR is never rewritten: a change of
mind is a new ADR that supersedes it. Typos and broken links can always be fixed.

## Consequences

- Contributors can see why things are the way they are before proposing a change.
- A pull request that goes against an accepted ADR should come with a new ADR.
