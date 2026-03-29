import fs from 'node:fs/promises';
import path from 'node:path';

const inputFiles = process.argv.slice(2);
const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;

const aggregateFromStats = (report) => {
  const stats = report.stats ?? {};

  return {
    total:
      Number(stats.expected ?? 0) +
      Number(stats.unexpected ?? 0) +
      Number(stats.skipped ?? 0),
    passed: Number(stats.expected ?? 0),
    failed: Number(stats.unexpected ?? 0),
    skipped: Number(stats.skipped ?? 0),
    flaky: Number(stats.flaky ?? 0),
  };
};

const summaries = [];

for (const filePath of inputFiles) {
  const report = JSON.parse(await fs.readFile(filePath, 'utf8'));
  summaries.push({
    name: path.basename(filePath, path.extname(filePath)),
    ...aggregateFromStats(report),
  });
}

const totals = summaries.reduce(
  (accumulator, current) => ({
    total: accumulator.total + current.total,
    passed: accumulator.passed + current.passed,
    failed: accumulator.failed + current.failed,
    skipped: accumulator.skipped + current.skipped,
    flaky: accumulator.flaky + current.flaky,
  }),
  { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 },
);

const lines = [
  '## Workflow summary',
  '',
  `Passed: ${totals.passed}`,
  `Failed: ${totals.failed}`,
  `Skipped: ${totals.skipped}`,
  `Flaky: ${totals.flaky}`,
  '',
  '| Run | Passed | Failed | Skipped | Flaky |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...summaries.map(
    (summary) =>
      `| ${summary.name} | ${summary.passed} | ${summary.failed} | ${summary.skipped} | ${summary.flaky} |`,
  ),
];

const summaryBody = `${lines.join('\n')}\n`;

if (stepSummaryPath) {
  await fs.appendFile(stepSummaryPath, summaryBody);
}

process.stdout.write(summaryBody);
