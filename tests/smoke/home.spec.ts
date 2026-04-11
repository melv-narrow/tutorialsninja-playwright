import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { HomePage } from '../../src/pages/home-page.js';
import { ROUTES } from '../../src/support/routes.js';
import { PRODUCTS, SEARCH_TERMS } from '../../src/support/test-data.js';

test.describe('Storefront smoke coverage', () => {
  qa(
    'renders the homepage and exposes primary navigation entry points',
    {
      epic: 'Storefront',
      feature: 'Navigation',
      story: 'Visitors can orient themselves from the home page',
      severity: Severity.CRITICAL,
      tags: ['@smoke', '@regression'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();

      await expect(homePage.featuredHeading).toBeVisible();
      await homePage.openMyAccountMenu();
      await expect(
        page.getByRole('link', { name: 'Register' }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Login' }).first(),
      ).toBeVisible();
      await page.keyboard.press('Escape');

      await page.goto(ROUTES.desktops);

      await expect(page).toHaveURL(/route=product\/category&path=20/);
      await expect(
        page.getByRole('heading', { name: 'Desktops' }),
      ).toBeVisible();
    },
  );

  qa(
    'finds a relevant product through the global search',
    {
      epic: 'Storefront',
      feature: 'Search',
      story: 'Visitors can discover products quickly',
      severity: Severity.CRITICAL,
      tags: ['@smoke', '@regression'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();
      await homePage.searchFor(SEARCH_TERMS.MACBOOK);

      await expect(page).toHaveURL(/route=product\/search/);
      await expect(
        page.getByRole('heading', { name: /Search - MacBook/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: PRODUCTS.MACBOOK, exact: true }).first(),
      ).toBeVisible();
    },
  );
});
