import { Severity } from 'allure-js-commons';
import { expect, qaAuth, test } from '../../src/fixtures/qa.js';
import { AccountPage } from '../../src/pages/account-page.js';
import { LoginPage } from '../../src/pages/login-page.js';
import { ROUTES } from '../../src/support/routes.js';

test.describe('Authenticated security-oriented coverage', () => {
  test.beforeEach(async ({ page, authUser }) => {
    const loginPage = new LoginPage(page);

    await page.context().clearCookies();
    await loginPage.goto();
    await expect(loginPage.returningCustomerHeading).toBeVisible();
    await loginPage.login(authUser);
    await expect(page).toHaveURL(/route=account\/account/);
  });

  qaAuth(
    'redirects protected routes to login after logout',
    {
      epic: 'Security',
      feature: 'Protected routes',
      story: 'Signed-out visitors cannot access account pages',
      severity: Severity.BLOCKER,
      tags: ['@regression', '@auth', '@security'],
    },
    async ({ page }) => {
      const accountPage = new AccountPage(page);

      await accountPage.goto();
      await accountPage.logout();

      await page.goto(ROUTES.account);
      await expect(page).toHaveURL(/route=account\/login/);

      await page.goto(ROUTES.editAccount);
      await expect(page).toHaveURL(/route=account\/login/);
    },
  );

  qaAuth(
    'invalidates browser back and refresh after logout from an authenticated page',
    {
      epic: 'Security',
      feature: 'Session invalidation',
      story: 'Browser navigation cannot revive an ended session',
      severity: Severity.CRITICAL,
      tags: ['@regression', '@auth', '@security'],
    },
    async ({ page }) => {
      const accountPage = new AccountPage(page);

      await page.goto(ROUTES.editAccount);
      await accountPage.logout();

      await page.goBack();
      await page.reload();

      await expect(page).toHaveURL(/route=account\/login/);
      await expect(
        page.getByRole('heading', { name: 'Returning Customer' }),
      ).toBeVisible();
    },
  );

  qaAuth(
    'forces re-authentication when the session cookie expires',
    {
      epic: 'Security',
      feature: 'Session expiry',
      story: 'Authenticated pages require a live session after refresh',
      severity: Severity.CRITICAL,
      tags: ['@regression', '@auth', '@security'],
    },
    async ({ page }) => {
      const accountPage = new AccountPage(page);

      await accountPage.goto();
      await expect(accountPage.accountHeading).toBeVisible();

      await page.context().clearCookies();
      await page.goto(ROUTES.account);

      await expect(page).toHaveURL(/route=account\/login/);
    },
  );
});
