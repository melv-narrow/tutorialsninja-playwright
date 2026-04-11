import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { HomePage } from '../../src/pages/home-page.js';
import { CategoryPage } from '../../src/pages/category-page.js';
import { SearchPage } from '../../src/pages/search-page.js';
import {
  capturePerformanceMetrics,
  assertPerformanceThresholds,
} from '../../src/support/performance.js';

test.describe('Performance regression coverage', () => {
  qa(
    'loads the homepage within acceptable performance thresholds',
    {
      epic: 'Performance',
      feature: 'Page load metrics',
      story: 'Homepage loads quickly for visitors',
      severity: Severity.NORMAL,
      tags: ['@regression', '@performance'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();
      await expect(homePage.featuredHeading).toBeVisible();

      const metrics = await capturePerformanceMetrics(page);

      // Assert reasonable thresholds for a demo site
      assertPerformanceThresholds(metrics, {
        ttfb: 2000, // 2 seconds - demo site can be slow
        fcp: 3000, // 3 seconds
        lcp: 5000, // 5 seconds
        loadTime: 8000, // 8 seconds total
      });

      // Attach metrics to Allure report
      await test.info().attach('Performance Metrics', {
        body: JSON.stringify(metrics, null, 2),
        contentType: 'application/json',
      });
    },
  );

  qa(
    'loads category pages with acceptable performance',
    {
      epic: 'Performance',
      feature: 'Page load metrics',
      story: 'Category pages load quickly for shoppers',
      severity: Severity.NORMAL,
      tags: ['@regression', '@performance'],
    },
    async ({ page }) => {
      const categoryPage = new CategoryPage(page);

      await categoryPage.gotoDesktops();
      await expect(
        page.getByRole('heading', { name: 'Desktops' }),
      ).toBeVisible();

      const metrics = await capturePerformanceMetrics(page);

      assertPerformanceThresholds(metrics, {
        ttfb: 2000,
        fcp: 3000,
        lcp: 5000,
        loadTime: 8000,
      });

      await test.info().attach('Performance Metrics', {
        body: JSON.stringify(metrics, null, 2),
        contentType: 'application/json',
      });
    },
  );

  qa(
    'performs search operations with acceptable response times',
    {
      epic: 'Performance',
      feature: 'Search performance',
      story: 'Search results appear quickly for visitors',
      severity: Severity.NORMAL,
      tags: ['@regression', '@performance'],
    },
    async ({ page }) => {
      const searchPage = new SearchPage(page);

      await searchPage.goto();

      const startTime = Date.now();
      await searchPage.search('laptop');
      await expect(page).toHaveURL(/route=product\/search/);
      const searchDuration = Date.now() - startTime;

      // Search should complete within 3 seconds
      expect(searchDuration).toBeLessThan(3000);

      const metrics = await capturePerformanceMetrics(page);

      await test.info().attach('Performance Metrics', {
        body: JSON.stringify(
          { ...metrics, searchDuration },
          null,
          2,
        ),
        contentType: 'application/json',
      });
    },
  );
});
