import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allureResultsDir = path.join(rootDir, 'allure-results');
const jsonReportDir = path.join(rootDir, 'test-results', 'json');

// Extract performance metrics from JSON reports
const extractPerformanceMetrics = async () => {
  const files = await fs.readdir(jsonReportDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const allMetrics = [];

  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(jsonReportDir, file), 'utf8');
    const report = JSON.parse(content);

    const allTests = report.suites.flatMap(suite =>
      suite.suites ? suite.suites.flatMap(s => s.specs || []) : suite.specs || []
    );

    const perfTests = allTests.filter(t => t.title.toLowerCase().includes('performance'));

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
          allMetrics.push(data);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return allMetrics;
};

// Generate environment.properties
const generateEnvironmentProperties = async (metrics) => {
  const avgTtfb = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) / metrics.length)
    : 0;
  const avgLcp = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / metrics.length)
    : 0;

  const properties = [
    'Browser=Chromium',
    'Base.URL=https://tutorialsninja.com/demo/',
    `Performance.Tests=${metrics.length}`,
    `Avg.TTFB=${avgTtfb}ms`,
    `Avg.LCP=${avgLcp}ms`,
  ].join('\n');

  await fs.writeFile(
    path.join(allureResultsDir, 'environment.properties'),
    properties
  );
};

// Generate categories.json for better test organization
const generateCategories = async () => {
  const categories = [
    {
      name: 'Performance Issues',
      matchedStatuses: ['failed'],
      messageRegex: '.*Performance thresholds exceeded.*',
    },
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*',
    },
    {
      name: 'Test defects',
      matchedStatuses: ['broken'],
    },
  ];

  await fs.writeFile(
    path.join(allureResultsDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );
};

// Main execution
const metrics = await extractPerformanceMetrics();
await generateEnvironmentProperties(metrics);
await generateCategories();

console.log(`✓ Generated Allure metadata with ${metrics.length} performance metrics`);
