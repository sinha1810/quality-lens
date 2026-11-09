import type {
  AnalysisSummary, PlaywrightReport, PlaywrightResult, PlaywrightSpec,
  PlaywrightSuite, PlaywrightTest, TestInsight, TestStatus
} from './types.js';

function normalizeStatus(value: string | undefined): TestStatus {
  if (value === 'passed' || value === 'failed' || value === 'skipped' || value === 'timedOut' || value === 'interrupted') return value;
  return 'unknown';
}

function resultStatus(results: PlaywrightResult[]): TestStatus {
  const last = results.at(-1);
  if (!last) return 'unknown';
  return normalizeStatus(last.status);
}

function errorMessage(results: PlaywrightResult[]): string | undefined {
  const failed = [...results].reverse().find((result: PlaywrightResult) => result.error?.message || result.errors?.[0]?.message);
  return failed?.error?.message || failed?.errors?.[0]?.message;
}

function visitSpecs(specs: PlaywrightSpec[] | undefined, file: string, out: TestInsight[], suitePath: string[] = []): void {
  for (const spec of specs ?? []) {
    const titlePath = [...suitePath, spec.title].filter(Boolean);
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const durationMs = results.reduce((sum, result) => sum + (result.duration ?? 0), 0);
      const retries = Math.max(0, results.length - 1);
      const project = test.projectName || 'default';
      out.push({
        id: `${file}:${titlePath.join(' › ')}:${project}`,
        title: [...titlePath, test.title].filter(Boolean).join(' › '),
        file: test.location?.file || file,
        project,
        status: resultStatus(results),
        durationMs,
        retries,
        error: errorMessage(results)
      });
    }
    visitSpecs(spec.specs, file, out, titlePath);
  }
}

function visitSuites(suites: PlaywrightSuite[] | undefined, out: TestInsight[], parentFile = ''): void {
  for (const suite of suites ?? []) {
    const file = suite.file || parentFile;
    visitSpecs(suite.specs, file, out);
    visitSuites(suite.suites, out, file);
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export function flattenReport(report: PlaywrightReport): TestInsight[] {
  const tests: TestInsight[] = [];
  visitSuites(report.suites, tests);
  return tests;
}

export function analyzeReport(report: PlaywrightReport, slowTestLimit = 5): AnalysisSummary {
  const tests = flattenReport(report);
  const count = (status: TestStatus) => tests.filter((test) => test.status === status).length;
  const flaky = tests.filter((test) => test.retries > 0 && test.status === 'passed').length;
  const slowest = [...tests].sort((a, b) => b.durationMs - a.durationMs).slice(0, slowTestLimit);
  const failures = tests.filter((test) => test.status === 'failed' || test.status === 'timedOut');
  const averageDurationMs = tests.length === 0 ? 0 : Math.round(tests.reduce((sum, test) => sum + test.durationMs, 0) / tests.length);
  const insights: string[] = [];

  if (flaky > 0) insights.push(`${flaky} test${flaky === 1 ? '' : 's'} passed only after a retry; investigate for flakiness.`);
  if (failures.length > 0) insights.push(`${failures.length} test${failures.length === 1 ? '' : 's'} need attention before the run is healthy.`);
  if (slowest[0]?.durationMs > 10_000) insights.push(`The slowest test took ${(slowest[0].durationMs / 1000).toFixed(1)}s; consider tracing its setup and network waits.`);
  if (tests.length > 0 && failures.length === 0 && flaky === 0) insights.push('No failed or retried tests were found in this report.');

  return {
    total: tests.length,
    passed: count('passed'),
    failed: count('failed'),
    skipped: count('skipped'),
    timedOut: count('timedOut'),
    flaky,
    averageDurationMs,
    p95DurationMs: percentile(tests.map((test) => test.durationMs), 95),
    slowest,
    failures,
    insights
  };
}
