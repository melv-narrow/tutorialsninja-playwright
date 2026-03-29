import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { CartPage } from '../../src/pages/cart-page.js';
import { ROUTES } from '../../src/support/routes.js';

test.describe('Guest cart and checkout guardrails', () => {
  qa(
    'redirects direct checkout access back to the cart when it is empty',
    {
      epic: 'Checkout',
      feature: 'Guardrails',
      story: 'Visitors cannot enter checkout without a cart',
      severity: Severity.CRITICAL,
      tags: ['@regression'],
    },
    async ({ page }) => {
      const cartPage = new CartPage(page);

      await page.goto(ROUTES.checkout);

      await expect(page).toHaveURL(/route=checkout\/cart/);
      await expect(
        page.locator('#content').getByText('Your shopping cart is empty!'),
      ).toBeVisible();
      await expect(
        page.locator('#content').getByRole('link', { name: 'Continue' }),
      ).toBeVisible();
      await expect(
        cartPage.page.getByRole('heading', { name: 'Shopping Cart' }),
      ).toBeVisible();
    },
  );
});
