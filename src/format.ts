import type { AnalysisSummary } from './types.js';

const duration = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

export function toMarkdown(summary: AnalysisSummary, source = 'Playwright report'): string {
  const health = summary.failed + summary.timedOut === 0 ? 'HEALTHY' : 'ACTION REQUIRED';
  const lines = [
    `# QualityLens report`, '', `Source: \`${source}\``, '', `## Run health: ${health}`, '',
    `| Metric | Value |`, `| --- | ---: |`,
    `| Total tests | ${summary.total} |`, `| Passed | ${summary.passed} |`,
    `| Failed | ${summary.failed} |`, `| Timed out | ${summary.timedOut} |`,
    `| Skipped | ${summary.skipped} |`, `| Flaky passes | ${summary.flaky} |`,
    `| Average duration | ${duration(summary.averageDurationMs)} |`, `| P95 duration | ${duration(summary.p95DurationMs)} |`, '',
    '## Insights', '', ...(summary.insights.length ? summary.insights.map((item) => `- ${item}`) : ['- No insights available.']), '',
    '## Slowest tests', '', '| Test | Status | Duration | Retries |', '| --- | --- | ---: | ---: |',
    ...(summary.slowest.length ? summary.slowest.map((test) => `| ${test.title} | ${test.status} | ${duration(test.durationMs)} | ${test.retries} |`) : ['| No tests | — | — | — |']), '',
    '## Failures', '',
    ...(summary.failures.length ? summary.failures.map((test) => `### ${test.title}\n\`${test.file}\`\n\n${test.error || 'No error message was recorded.'}`) : ['No failures recorded.'])
  ];
  return `${lines.join('\n')}\n`;
}
