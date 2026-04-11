import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { CartPage } from '../../src/pages/cart-page.js';
import { HomePage } from '../../src/pages/home-page.js';
import { PRODUCTS } from '../../src/support/test-data.js';

test.describe('Shopping smoke coverage', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state by clearing cookies/storage before each test
    await page.context().clearCookies();
  });

  qa(
    'adds a featured product to the cart through the happy path',
    {
      epic: 'Storefront',
      feature: 'Cart',
      story: 'Visitors can begin checkout from a featured product',
      severity: Severity.BLOCKER,
      tags: ['@smoke', '@regression'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);
      const cartPage = new CartPage(page);

      await homePage.goto();
      await homePage.addFeaturedProductToCart(PRODUCTS.MACBOOK);

      await expect(homePage.successAlert).toContainText(
        `Success: You have added ${PRODUCTS.MACBOOK}`,
      );
      await cartPage.goto();
      await expect(cartPage.cartRow(PRODUCTS.MACBOOK)).toBeVisible();
    },
  );

  qa(
    'keeps registration and login entry points reachable from the header menu',
    {
      epic: 'Storefront',
      feature: 'Authentication entry points',
      story: 'Visitors can start account flows from the home page',
      severity: Severity.NORMAL,
      tags: ['@smoke', '@regression'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();
      await homePage.openRegister();
      await expect(page).toHaveURL(/route=account\/register/);

      await homePage.goto();
      await homePage.openLogin();
      await expect(page).toHaveURL(/route=account\/login/);
    },
  );
});
