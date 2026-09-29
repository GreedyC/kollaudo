# Kollaudo

> *Collaudo* (Italian): the final acceptance test before something is put into service.

**Is release `1.4.2` in staging healthy enough to promote?**

Today the answer is scattered across your CI, your test reports, your code-quality tools and your
deployment tools. Kollaudo brings those signals together around the thing you actually ship:
a **release** running in an **environment**.

> ⚠️ Early development. Not ready for production use yet.

## What it does

- **Collects test results** from any framework and any CI, via open formats
  ([CTRF](https://ctrf.io), JUnit XML).
- **Records deployments** from any delivery tool: which release runs in which environment.
- **Links everything to releases**: unit, e2e and UAT results, bugs, coverage.
- **Answers one question** over a plain HTTP API: *is this release, in this environment, healthy?*
- **Gates promotions** in any tool that can call a URL or run a command.

## What it is not

- **Not a CI system.** It doesn't build your code.
- **Not a test runner** (for now). Your CI runs the tests; Kollaudo receives the results.
- **Not a DORA or observability dashboard.** It decides whether a release is ready,
  not how fast you deliver.

## Core concepts

Kollaudo's model is tool-agnostic. Every delivery process has these, whatever it calls them:

| Kollaudo | Examples |
|---|---|
| **Component** | a service, an app, a library you release |
| **Environment** | `dev`, `staging`, `production`, a cluster, a namespace |
| **Release** | whatever identifies what you ship: a semver, a git SHA, an image tag, a Kargo Freight |
| **Deployment** | "release X of component Y is now running in environment Z" |
| **Test run** | results of a unit, e2e, UAT or manual test session, tied to a release and an environment |
| **Verdict** | *pass* or *fail* for a release in an environment, with the reasons |

## How it works

```
Any CI / script    ── kollaudo CLI ──►┐
Anything with HTTP ── API /v1     ──►├──►  Kollaudo  ──►  verdict
CDEvents tools     ── CDEvents    ──►┘                    (UI, API, CLI)
```

- **Push-based.** Tools send data to Kollaudo. It never needs credentials to your systems.
- **Self-hosted.** One container plus PostgreSQL. Your test and deployment data stay with you.
- **API-first.** The bundled UI uses only the public API, so you can build on the same data:
  Backstage, Grafana, your own portal.

## Works with anything

Kollaudo's core knows nothing about specific tools. Everything comes in through three generic
entry points:

| Entry point | Use it from |
|---|---|
| `kollaudo` CLI | any CI or script: GitHub Actions, GitLab CI, Jenkins, Azure DevOps, bash… |
| HTTP API `/v1` | anything that can send a request |
| [CDEvents](https://cdevents.dev) | any tool that emits them: Tekton, Jenkins, Testkube… |

The verdict is just as generic: any promotion tool that can call a URL or run a command can use it
as a gate.

```bash
kollaudo verdict --component api --env staging --release 1.4.2   # exit code 0 = pass, 1 = fail
```

Ready-made **recipes** turn popular tools' events into those calls.

| Recipe | Status |
|---|---|
| Playwright (CTRF reporter) | planned for v0.1 |
| GitHub Actions | planned |
| Argo CD notifications | planned |
| Kargo verification gate | planned |
| Flux, GitLab, Argo Rollouts, Flagger, Spinnaker… | contributions welcome |

## Quick start

*Coming with v0.1.*

```bash
docker compose up

npx @kollaudo/cli push report.ctrf.json \
  --project demo --component frontend --env staging --release 1.2.0
```

Then open the UI to see the health of each component in each environment.

## Roadmap

- **v0.1**: CTRF ingest, CLI, component × environment health view
- **v0.2**: JUnit, deployments, verdict API, first recipes (GitHub Actions, Argo CD)
- **v0.3**: bugs linked to failed tests, UAT and manual acceptance checks
- **v0.4**: gate recipes (Kargo, CI step, GitHub deployment protection), CDEvents in/out, SARIF

## Design decisions

Architecture decisions are recorded in [`docs/adr/`](docs/adr/).

## Contributing

The project is at a very early stage. Ideas, use cases and feedback are welcome in
[Issues](https://github.com/kollaudo/kollaudo/issues).

## License

[Apache-2.0](LICENSE)
