import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { CartPage } from '../../src/pages/cart-page.js';
import { CategoryPage } from '../../src/pages/category-page.js';
import { ROUTES } from '../../src/support/routes.js';

test.describe('Catalog and cart regression coverage', () => {
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
      await categoryPage.addToCompare('MacBook');
      await expect(categoryPage.successAlert).toContainText('MacBook');

      await categoryPage.addToCompare('iPhone');
      await expect(categoryPage.successAlert).toContainText('iPhone');

      await page.goto(ROUTES.compare);

      await expect(
        page.getByRole('heading', { name: 'Product Comparison' }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'MacBook', exact: true }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'iPhone', exact: true }).first(),
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
      await categoryPage.addToCart('MacBook');
      await expect(categoryPage.successAlert).toContainText(
        'Success: You have added MacBook',
      );

      await cartPage.goto();
      await cartPage.updateQuantity('MacBook', 2);
      await expect(cartPage.successAlert).toContainText(
        'Success: You have modified your shopping cart',
      );
      await expect(
        cartPage.cartRow('MacBook').locator('input[name*="quantity"]'),
      ).toHaveValue('2');

      await cartPage.removeProduct('MacBook');
      await expect(
        page.locator('#content').getByText('Your shopping cart is empty!'),
      ).toBeVisible();
    },
  );
});
