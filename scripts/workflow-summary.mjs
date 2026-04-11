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

const extractPerformanceMetrics = (report) => {
  const allTests = report.suites.flatMap(suite =>
    suite.suites ? suite.suites.flatMap(s => s.specs || []) : suite.specs || []
  );

  const perfTests = allTests.filter(test =>
    test.title.toLowerCase().includes('performance')
  );

  const metrics = [];

  for (const test of perfTests) {
    if (!test.tests || test.tests.length === 0) continue;

    const result = test.tests[0].results?.[0];
    if (!result) continue;

    const perfAttachment = result.attachments?.find(
      a => a.name === 'Performance Metrics'
    );

    if (perfAttachment && perfAttachment.body) {
      try {
        const data = JSON.parse(
          Buffer.from(perfAttachment.body, 'base64').toString()
        );
        metrics.push({
          title: test.title.replace(/@\w+/g, '').trim(),
          ...data
        });
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  return metrics;
};

const summaries = [];
const allPerformanceMetrics = [];

for (const filePath of inputFiles) {
  const report = JSON.parse(await fs.readFile(filePath, 'utf8'));
  summaries.push({
    name: path.basename(filePath, path.extname(filePath)),
    ...aggregateFromStats(report),
  });

  const perfMetrics = extractPerformanceMetrics(report);
  allPerformanceMetrics.push(...perfMetrics);
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

// Add performance metrics section if any were found
if (allPerformanceMetrics.length > 0) {
  lines.push('');
  lines.push('## ⚡ Performance Metrics');
  lines.push('');
  lines.push('| Page | TTFB | FCP | LCP | Load Time |');
  lines.push('| --- | ---: | ---: | ---: | ---: |');

  for (const metric of allPerformanceMetrics) {
    const ttfb = metric.ttfb ? `${Math.round(metric.ttfb)}ms` : '-';
    const fcp = metric.fcp ? `${Math.round(metric.fcp)}ms` : '-';
    const lcp = metric.lcp ? `${Math.round(metric.lcp)}ms` : '-';
    const loadTime = metric.loadTime ? `${Math.round(metric.loadTime)}ms` : '-';

    lines.push(`| ${metric.title} | ${ttfb} | ${fcp} | ${lcp} | ${loadTime} |`);
  }

  // Add performance summary
  const avgTtfb = allPerformanceMetrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) / allPerformanceMetrics.length;
  const avgLcp = allPerformanceMetrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / allPerformanceMetrics.length;

  lines.push('');
  lines.push(`**Average TTFB:** ${Math.round(avgTtfb)}ms | **Average LCP:** ${Math.round(avgLcp)}ms`);
}

const summaryBody = `${lines.join('\n')}\n`;

if (stepSummaryPath) {
  await fs.appendFile(stepSummaryPath, summaryBody);
}

process.stdout.write(summaryBody);
