import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { CartPage } from '../../src/pages/cart-page.js';
import { CategoryPage } from '../../src/pages/category-page.js';
import { ComparePage } from '../../src/pages/compare-page.js';
import { ROUTES } from '../../src/support/routes.js';
import { PRODUCTS } from '../../src/support/test-data.js';

test.describe('Catalog and cart regression coverage', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state by clearing cookies/storage before each test
    // This forces a new session on the demo site, preventing state leakage between tests
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  qa(
    'sorts the desktop catalog by highest price first',
    {
      epic: 'Catalog',
      feature: 'Sorting',
      story: 'Shoppers can order products by price',
      severity: Severity.CRITICAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const categoryPage = new CategoryPage(page);

      await categoryPage.gotoDesktops();
      const defaultProductNames = await categoryPage.getVisibleProductNames();
      await categoryPage.sortBy('Price (High > Low)');

      await expect(page).toHaveURL(/sort=p\.price&order=DESC/);
      const productNames = await categoryPage.getVisibleProductNames();
      expect(productNames[0]).not.toBe(defaultProductNames[0]);
    },
  );

  qa(
    'adds products to comparison from the category listing',
    {
      epic: 'Catalog',
      feature: 'Product comparison',
      story: 'Shoppers can compare multiple products before buying',
      severity: Severity.NORMAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const categoryPage = new CategoryPage(page);

      await categoryPage.gotoDesktops();
      await categoryPage.addToCompare(PRODUCTS.MACBOOK);
      await expect(categoryPage.successAlert).toContainText(PRODUCTS.MACBOOK);

      await categoryPage.addToCompare(PRODUCTS.IPHONE);
      await expect(categoryPage.successAlert).toContainText(PRODUCTS.IPHONE);

      await page.goto(ROUTES.compare);

      await expect(
        page.getByRole('heading', { name: 'Product Comparison' }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: PRODUCTS.MACBOOK, exact: true }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: PRODUCTS.IPHONE, exact: true }).first(),
      ).toBeVisible();
    },
  );

  qa(
    'updates cart quantity and removes a product cleanly',
    {
      epic: 'Cart',
      feature: 'Cart management',
      story: 'Shoppers can adjust quantities before checkout',
      severity: Severity.CRITICAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const categoryPage = new CategoryPage(page);
      const cartPage = new CartPage(page);

      await categoryPage.gotoDesktops();
      await categoryPage.addToCart(PRODUCTS.MACBOOK);
      await expect(categoryPage.successAlert).toContainText(
        `Success: You have added ${PRODUCTS.MACBOOK}`,
      );

      await cartPage.goto();
      await cartPage.updateQuantity(PRODUCTS.MACBOOK, 2);
      await expect(cartPage.successAlert).toContainText(
        'Success: You have modified your shopping cart',
      );
      await expect(
        cartPage.cartRow(PRODUCTS.MACBOOK).locator('input[name*="quantity"]'),
      ).toHaveValue('2');

      await cartPage.removeProduct(PRODUCTS.MACBOOK);
      await expect(
        page.locator('#content').getByText('Your shopping cart is empty!'),
      ).toBeVisible();
    },
  );

  qa(
    'removes a product from the comparison view and returns to the empty state',
    {
      epic: 'Catalog',
      feature: 'Product comparison',
      story: 'Shoppers can clear compared products after review',
      severity: Severity.NORMAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const categoryPage = new CategoryPage(page);
      const comparePage = new ComparePage(page);

      await categoryPage.gotoDesktops();
      await categoryPage.addToCompare(PRODUCTS.MACBOOK);
      await expect(categoryPage.successAlert).toContainText(PRODUCTS.MACBOOK);

      await comparePage.goto();
      await expect(comparePage.productLink(PRODUCTS.MACBOOK)).toBeVisible();

      await comparePage.removeProduct(PRODUCTS.MACBOOK);
      await expect(comparePage.emptyState).toBeVisible();
    },
  );
});
