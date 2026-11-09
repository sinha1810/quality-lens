export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted' | 'unknown';

export interface PlaywrightResult {
  status?: string;
  duration?: number;
  error?: { message?: string; stack?: string };
  errors?: Array<{ message?: string; stack?: string }>;
  retry?: number;
  workerIndex?: number;
  startTime?: string;
}

export interface PlaywrightTest {
  title: string;
  projectName?: string;
  location?: { file?: string; line?: number; column?: number };
  results?: PlaywrightResult[];
  status?: string;
}

export interface PlaywrightSpec {
  title: string;
  file?: string;
  tests?: PlaywrightTest[];
  specs?: PlaywrightSpec[];
}

export interface PlaywrightSuite {
  title?: string;
  file?: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightReport {
  config?: { projects?: Array<{ name?: string }> };
  suites?: PlaywrightSuite[];
}

export interface TestInsight {
  id: string;
  title: string;
  file: string;
  project: string;
  status: TestStatus;
  durationMs: number;
  retries: number;
  error?: string;
}

export interface AnalysisSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  flaky: number;
  averageDurationMs: number;
  p95DurationMs: number;
  slowest: TestInsight[];
  failures: TestInsight[];
  insights: string[];
}
