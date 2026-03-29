import { Severity } from 'allure-js-commons';
import { expect, qaAuth, test } from '../../src/fixtures/qa.js';
import { AccountPage } from '../../src/pages/account-page.js';
import { HomePage } from '../../src/pages/home-page.js';
import { LoginPage } from '../../src/pages/login-page.js';

test.describe('Authenticated account regression coverage', () => {
  test.beforeEach(async ({ page, authUser }) => {
    const loginPage = new LoginPage(page);

    await page.context().clearCookies();
    await loginPage.goto();
    await expect(loginPage.returningCustomerHeading).toBeVisible();
    await loginPage.login(authUser);
    await expect(page).toHaveURL(/route=account\/account/);
  });

  qaAuth(
    'logs out and logs back in with the run-scoped account',
    {
      epic: 'Authentication',
      feature: 'Login lifecycle',
      story: 'Returning customers can re-authenticate after logout',
      severity: Severity.BLOCKER,
      tags: ['@regression', '@auth'],
    },
    async ({ page, authUser }) => {
      const accountPage = new AccountPage(page);
      const loginPage = new LoginPage(page);

      await accountPage.goto();
      await expect(accountPage.accountHeading).toBeVisible();

      await accountPage.logout();
      await expect(page).toHaveURL(/route=account\/logout/);

      await loginPage.goto();
      await expect(loginPage.returningCustomerHeading).toBeVisible();
      await loginPage.login(authUser);
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(accountPage.accountHeading).toBeVisible();
    },
  );

  qaAuth(
    'adds a product to the wishlist and keeps it after a reload',
    {
      epic: 'Account',
      feature: 'Wishlist',
      story: 'Signed-in shoppers can curate saved products',
      severity: Severity.CRITICAL,
      tags: ['@regression', '@auth'],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);
      const accountPage = new AccountPage(page);

      await accountPage.goto();
      await expect(accountPage.accountHeading).toBeVisible();
      await homePage.goto();
      await homePage.addFeaturedProductToWishlist('MacBook');
      await expect(homePage.successAlert).toContainText(
        'Success: You have added MacBook',
      );

      await accountPage.openWishlist();
      await expect(accountPage.wishlistRow('MacBook')).toBeVisible();

      await page.reload();
      await expect(accountPage.wishlistRow('MacBook')).toBeVisible();

      await accountPage
        .wishlistRow('MacBook')
        .locator('a[data-original-title="Remove"]')
        .click();
      await expect(accountPage.successAlert).toContainText(
        'Success: You have modified your wish list',
      );
    },
  );

  qaAuth(
    'updates the customer newsletter preference from the account area',
    {
      epic: 'Account',
      feature: 'Preferences',
      story: 'Signed-in shoppers can manage newsletter settings',
      severity: Severity.NORMAL,
      tags: ['@regression', '@auth'],
    },
    async ({ page }) => {
      const accountPage = new AccountPage(page);

      await accountPage.goto();
      await expect(accountPage.accountHeading).toBeVisible();
      await accountPage.openNewsletter();
      await page.locator('input[name="newsletter"][value="1"]').check();
      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(accountPage.successAlert).toContainText(
        'Success: Your newsletter subscription has been successfully updated',
      );
    },
  );
});
