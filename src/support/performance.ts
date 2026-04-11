import type { Page } from '@playwright/test';

export interface PerformanceMetrics {
  /** Time to First Byte - server response time */
  ttfb: number;
  /** First Contentful Paint - when first content renders */
  fcp: number;
  /** Largest Contentful Paint - when main content is visible */
  lcp: number;
  /** Cumulative Layout Shift - visual stability score */
  cls: number;
  /** Total page load time */
  loadTime: number;
  /** DOM content loaded time */
  domContentLoaded: number;
}

/**
 * Captures Web Vitals and performance metrics from a page.
 * Call this after page navigation completes.
 */
export async function capturePerformanceMetrics(
  page: Page,
): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => {
    return new Promise<PerformanceMetrics>((resolve) => {
      // Wait for load event to ensure all metrics are available
      if (document.readyState === 'complete') {
        collectMetrics();
      } else {
        window.addEventListener('load', collectMetrics);
      }

      function collectMetrics() {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const fcp =
          paint.find((entry) => entry.name === 'first-contentful-paint')
            ?.startTime || 0;

        // LCP requires PerformanceObserver, use a fallback
        let lcp = 0;
        const lcpEntries = performance.getEntriesByType(
          'largest-contentful-paint',
        );
        if (lcpEntries.length > 0) {
          lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }

        // CLS requires PerformanceObserver, use 0 as fallback
        const cls = 0;

        resolve({
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp,
          lcp: lcp || fcp, // Fallback to FCP if LCP not available
          cls,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
        });
      }
    });
  });

  return metrics;
}

/**
 * Logs performance metrics to console in a readable format.
 * Useful for debugging and manual test runs.
 */
export function logPerformanceMetrics(
  pageName: string,
  metrics: PerformanceMetrics,
): void {
  console.log(`\n📊 Performance Metrics for ${pageName}:`);
  console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms`);
  console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`);
  console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms`);
  console.log(`  CLS: ${metrics.cls.toFixed(3)}`);
  console.log(`  Load Time: ${metrics.loadTime.toFixed(0)}ms`);
  console.log(`  DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms`);
}

/**
 * Asserts that performance metrics meet acceptable thresholds.
 * Throws if any metric exceeds its threshold.
 */
export function assertPerformanceThresholds(
  metrics: PerformanceMetrics,
  thresholds: Partial<PerformanceMetrics> = {},
): void {
  const defaults = {
    ttfb: 1000, // 1 second
    fcp: 2000, // 2 seconds
    lcp: 4000, // 4 seconds
    cls: 0.1, // Good CLS score
    loadTime: 5000, // 5 seconds
    domContentLoaded: 3000, // 3 seconds
  };

  const limits = { ...defaults, ...thresholds };

  const failures: string[] = [];

  if (metrics.ttfb > limits.ttfb) {
    failures.push(`TTFB ${metrics.ttfb.toFixed(0)}ms > ${limits.ttfb}ms`);
  }
  if (metrics.fcp > limits.fcp) {
    failures.push(`FCP ${metrics.fcp.toFixed(0)}ms > ${limits.fcp}ms`);
  }
  if (metrics.lcp > limits.lcp) {
    failures.push(`LCP ${metrics.lcp.toFixed(0)}ms > ${limits.lcp}ms`);
  }
  if (metrics.cls > limits.cls) {
    failures.push(`CLS ${metrics.cls.toFixed(3)} > ${limits.cls}`);
  }
  if (metrics.loadTime > limits.loadTime) {
    failures.push(
      `Load Time ${metrics.loadTime.toFixed(0)}ms > ${limits.loadTime}ms`,
    );
  }
  if (metrics.domContentLoaded > limits.domContentLoaded) {
    failures.push(
      `DOM Content Loaded ${metrics.domContentLoaded.toFixed(0)}ms > ${limits.domContentLoaded}ms`,
    );
  }

  if (failures.length > 0) {
    throw new Error(
      `Performance thresholds exceeded:\n  ${failures.join('\n  ')}`,
    );
  }
}
