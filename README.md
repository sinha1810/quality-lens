# QualityLens

QualityLens turns a Playwright JSON report into a compact, actionable quality brief. It surfaces failed tests, slow tests, retry-based flaky passes, duration percentiles, and machine-readable summary data for CI pipelines.

## Why this exists

A raw Playwright report tells you what happened. QualityLens is designed to answer what needs attention first. It keeps the analysis deterministic and local: the report is read from disk, no test data is uploaded, and the same input produces the same output.

## Features

- Parses nested Playwright suites and projects.
- Detects tests that passed only after one or more retries.
- Preserves failure messages and test locations.
- Calculates average and P95 test duration.
- Lists the slowest tests for targeted investigation.
- Emits JSON for automation or Markdown for pull-request artifacts.
- Includes TypeScript unit tests and GitHub Actions CI.

## Quick start

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
npm run build
```

Analyze a report produced by Playwright:

```bash
node dist/cli.js analyze path/to/report.json
node dist/cli.js analyze path/to/report.json --format markdown --out quality-report.md
```

To make Playwright produce a JSON report, configure its reporter in `playwright.config.ts`:

```ts
reporter: [['json', { outputFile: 'artifacts/playwright.json' }]]
```

## Architecture

`src/analyze.ts` owns parsing and aggregation. It flattens Playwright’s recursive suite structure into stable test insights, then computes summary metrics without depending on the CLI. `src/format.ts` is a pure Markdown renderer. `src/cli.ts` is a thin adapter for filesystem and command-line concerns. This separation keeps the analysis easy to test and makes future outputs possible without changing the core model.

## Engineering trade-offs

QualityLens intentionally treats the final result in a retry sequence as the test’s current status while retaining the retry count and the first error message. This mirrors how CI teams usually classify a retried pass, but it also makes flakiness visible instead of hiding it. The current P95 implementation is a nearest-rank percentile, which is simple and predictable for small CI batches; a future version could add a configurable percentile strategy for large historical datasets.

## Roadmap

- Compare reports across commits to show regressions.
- Add a GitHub Actions summary writer.
- Support Playwright annotations and tags as filter dimensions.
- Add a configurable failure policy for CI exit codes.
- Add property-based tests for unusual report shapes.

## License

MIT
