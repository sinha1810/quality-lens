#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { analyzeReport } from './analyze.js';
import { toMarkdown } from './format.js';
import type { PlaywrightReport } from './types.js';

function help(): void {
  console.log(`QualityLens — actionable analysis for Playwright JSON reports\n\nUsage:\n  quality-lens analyze <report.json> [--format json|markdown] [--out path]\n\nExamples:\n  quality-lens analyze test-results.json\n  quality-lens analyze test-results.json --format markdown --out quality-report.md`);
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(): Promise<void> {
  const [, , command, input, ...args] = process.argv;
  if (command !== 'analyze' || !input || args.includes('--help')) return help();
  const format = option(args, '--format') || 'json';
  if (!['json', 'markdown'].includes(format)) throw new Error('Format must be json or markdown.');
  const report = JSON.parse(await readFile(input, 'utf8')) as PlaywrightReport;
  const summary = analyzeReport(report);
  const output = format === 'markdown' ? toMarkdown(summary, path.basename(input)) : `${JSON.stringify(summary, null, 2)}\n`;
  const out = option(args, '--out');
  if (out) await writeFile(out, output, 'utf8');
  else process.stdout.write(output);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
