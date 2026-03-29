import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { SearchPage } from '../../src/pages/search-page.js';

test.describe('Search regression coverage', () => {
  qa(
    'shows a clear empty-state message when search criteria return nothing',
    {
      epic: 'Catalog',
      feature: 'Search',
      story: 'Visitors get actionable feedback for no-result searches',
      severity: Severity.NORMAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const searchPage = new SearchPage(page);

      await searchPage.goto();
      await searchPage.search('');

      await expect(searchPage.noResultsMessage).toBeVisible();
    },
  );

  qa(
    'expands search results when product descriptions are included',
    {
      epic: 'Catalog',
      feature: 'Search',
      story: 'Visitors can broaden discovery by searching descriptions',
      severity: Severity.CRITICAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const searchPage = new SearchPage(page);

      await searchPage.goto();
      await searchPage.search('macbook', { includeDescription: true });

      await expect(page).toHaveURL(/description=true/);
      await expect(
        page
          .getByRole('link', { name: 'Apple Cinema 30"', exact: true })
          .first(),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'MacBook Pro', exact: true }).first(),
      ).toBeVisible();
    },
  );
});
