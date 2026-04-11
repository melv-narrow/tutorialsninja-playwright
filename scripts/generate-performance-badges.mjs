import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonReportDir = path.join(rootDir, 'test-results', 'json');
const readmePath = path.join(rootDir, 'README.md');
const badgesPath = path.join(rootDir, 'docs', 'performance-badges.json');

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

const getColorForMetric = (value, thresholds) => {
  if (value < thresholds.good) return 'brightgreen';
  if (value < thresholds.warning) return 'yellow';
  return 'red';
};

const generateBadges = (metrics) => {
  if (metrics.length === 0) {
    return {
      ttfb: { value: 0, color: 'lightgrey' },
      lcp: { value: 0, color: 'lightgrey' },
      tests: { value: 0, color: 'lightgrey' }
    };
  }

  const avgTtfb = Math.round(
    metrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) / metrics.length
  );
  const avgLcp = Math.round(
    metrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / metrics.length
  );

  return {
    ttfb: {
      value: avgTtfb,
      color: getColorForMetric(avgTtfb, { good: 1000, warning: 2000 })
    },
    lcp: {
      value: avgLcp,
      color: getColorForMetric(avgLcp, { good: 2500, warning: 4000 })
    },
    tests: {
      value: metrics.length,
      color: 'blue'
    }
  };
};

const updateReadme = async (badges) => {
  const readme = await fs.readFile(readmePath, 'utf8');

  const ttfbBadge = `![TTFB](https://img.shields.io/badge/TTFB-${badges.ttfb.value}ms-${badges.ttfb.color})`;
  const lcpBadge = `![LCP](https://img.shields.io/badge/LCP-${badges.lcp.value}ms-${badges.lcp.color})`;
  const perfTestsBadge = `![Performance Tests](https://img.shields.io/badge/Performance%20Tests-${badges.tests.value}-${badges.tests.color})`;

  // Find the first line with badges
  const lines = readme.split('\n');
  const badgeLineIndex = lines.findIndex(line => line.includes('![CI]'));

  if (badgeLineIndex !== -1) {
    // Check if performance badges already exist
    if (lines[badgeLineIndex].includes('![TTFB]')) {
      // Replace existing performance badges
      lines[badgeLineIndex] = lines[badgeLineIndex].replace(
        /!\[TTFB\][^\s]+\s*!\[LCP\][^\s]+\s*!\[Performance Tests\][^\s]+\s*/,
        `${ttfbBadge} ${lcpBadge} ${perfTestsBadge} `
      );
    } else {
      // Add performance badges after existing badges
      lines[badgeLineIndex] = `${lines[badgeLineIndex]} ${ttfbBadge} ${lcpBadge} ${perfTestsBadge}`;
    }

    await fs.writeFile(readmePath, lines.join('\n'));
  }
};

// Main execution
const metrics = await extractPerformanceMetrics();
const badges = generateBadges(metrics);

// Save badge data for CI
await fs.mkdir(path.dirname(badgesPath), { recursive: true });
await fs.writeFile(badgesPath, JSON.stringify(badges, null, 2));

// Update README
await updateReadme(badges);

console.log(`✓ Generated performance badges:`);
console.log(`  TTFB: ${badges.ttfb.value}ms (${badges.ttfb.color})`);
console.log(`  LCP: ${badges.lcp.value}ms (${badges.lcp.color})`);
console.log(`  Tests: ${badges.tests.value}`);
