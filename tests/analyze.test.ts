import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { analyzeReport, flattenReport } from '../src/analyze.js';
import type { PlaywrightReport } from '../src/types.js';

async function fixture(): Promise<PlaywrightReport> {
  return JSON.parse(await readFile(new URL('./fixtures/report.json', import.meta.url), 'utf8')) as PlaywrightReport;
}

describe('QualityLens analyzer', () => {
  it('flattens nested Playwright suites into stable test insights', async () => {
    const tests = flattenReport(await fixture());
    expect(tests).toHaveLength(2);
    expect(tests[0].title).toBe('checkout › completes a purchase');
    expect(tests[1].file).toBe('tests/checkout.spec.ts');
  });

  it('detects flaky passes and preserves the original failure message', async () => {
    const summary = analyzeReport(await fixture());
    expect(summary.total).toBe(2);
    expect(summary.passed).toBe(2);
    expect(summary.flaky).toBe(1);
    expect(summary.failures).toHaveLength(0);
    expect(summary.slowest[0].error).toBe('Expected 200, received 504');
  });

  it('handles empty reports without NaN values', () => {
    const summary = analyzeReport({ suites: [] });
    expect(summary.total).toBe(0);
    expect(summary.averageDurationMs).toBe(0);
    expect(summary.p95DurationMs).toBe(0);
  });
});
