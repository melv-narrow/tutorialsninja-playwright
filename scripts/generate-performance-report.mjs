import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonReportDir = path.join(rootDir, 'test-results', 'json');
const outputPath = path.join(rootDir, 'performance-report.html');

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
          allMetrics.push({
            title: test.title.replace(/@\w+/g, '').trim(),
            timestamp: result.startTime,
            ...data
          });
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return allMetrics;
};

const generateHTML = (metrics) => {
  const avgTtfb = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) / metrics.length)
    : 0;
  const avgFcp = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.fcp || 0), 0) / metrics.length)
    : 0;
  const avgLcp = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / metrics.length)
    : 0;
  const avgLoadTime = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / metrics.length)
    : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - TutorialsNinja Playwright</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
      color: #1a202c;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
      color: white;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }

    .metric-label {
      font-size: 0.875rem;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      line-height: 1;
    }

    .metric-unit {
      font-size: 1rem;
      color: #a0aec0;
      margin-left: 0.25rem;
    }

    .details-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .test-item {
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s;
    }

    .test-item:last-child {
      border-bottom: none;
    }

    .test-item:hover {
      background-color: #f7fafc;
    }

    .test-title {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.75rem;
    }

    .test-metrics {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .test-metric {
      display: flex;
      flex-direction: column;
    }

    .test-metric-label {
      font-size: 0.75rem;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .test-metric-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: #4a5568;
    }

    .good { color: #48bb78; }
    .warning { color: #ed8936; }
    .poor { color: #f56565; }

    .timestamp {
      font-size: 0.875rem;
      color: #a0aec0;
      margin-top: 1rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .test-metrics {
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>⚡ Performance Report</h1>
      <p class="subtitle">TutorialsNinja Playwright Test Suite</p>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Avg TTFB</div>
        <div class="metric-value ${avgTtfb < 1000 ? 'good' : avgTtfb < 2000 ? 'warning' : 'poor'}">
          ${avgTtfb}<span class="metric-unit">ms</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg FCP</div>
        <div class="metric-value ${avgFcp < 2000 ? 'good' : avgFcp < 3000 ? 'warning' : 'poor'}">
          ${avgFcp}<span class="metric-unit">ms</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg LCP</div>
        <div class="metric-value ${avgLcp < 2500 ? 'good' : avgLcp < 4000 ? 'warning' : 'poor'}">
          ${avgLcp}<span class="metric-unit">ms</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg Load Time</div>
        <div class="metric-value ${avgLoadTime < 3000 ? 'good' : avgLoadTime < 5000 ? 'warning' : 'poor'}">
          ${avgLoadTime}<span class="metric-unit">ms</span>
        </div>
      </div>
    </div>

    <div class="details-section">
      <h2 class="section-title">Test Details</h2>
      ${metrics.map(m => `
        <div class="test-item">
          <div class="test-title">${m.title}</div>
          <div class="test-metrics">
            ${m.ttfb ? `
              <div class="test-metric">
                <div class="test-metric-label">TTFB</div>
                <div class="test-metric-value">${Math.round(m.ttfb)}ms</div>
              </div>
            ` : ''}
            ${m.fcp ? `
              <div class="test-metric">
                <div class="test-metric-label">FCP</div>
                <div class="test-metric-value">${Math.round(m.fcp)}ms</div>
              </div>
            ` : ''}
            ${m.lcp ? `
              <div class="test-metric">
                <div class="test-metric-label">LCP</div>
                <div class="test-metric-value">${Math.round(m.lcp)}ms</div>
              </div>
            ` : ''}
            ${m.loadTime ? `
              <div class="test-metric">
                <div class="test-metric-label">Load Time</div>
                <div class="test-metric-value">${Math.round(m.loadTime)}ms</div>
              </div>
            ` : ''}
            ${m.domContentLoaded ? `
              <div class="test-metric">
                <div class="test-metric-label">DOM Ready</div>
                <div class="test-metric-value">${Math.round(m.domContentLoaded)}ms</div>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;
};

// Main execution
const metrics = await extractPerformanceMetrics();
const html = generateHTML(metrics);
await fs.writeFile(outputPath, html);

console.log(`✓ Generated performance report: ${outputPath}`);
console.log(`  ${metrics.length} performance tests analyzed`);
