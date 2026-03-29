import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { LoginPage } from '../../src/pages/login-page.js';
import { RegisterPage } from '../../src/pages/register-page.js';
import { persistAuthenticatedUser } from '../../src/support/auth.js';
import { ROUTES } from '../../src/support/routes.js';
import { createTestUser } from '../../src/support/test-users.js';

test.describe('Run-scoped account setup', () => {
  qa(
    'registers a fresh customer account and saves authenticated state',
    {
      epic: 'Authentication',
      feature: 'Account provisioning',
      story: 'Run-scoped registration',
      severity: Severity.CRITICAL,
      tags: ['@setup', '@auth'],
      description:
        'Creates a unique account for the current run so authenticated suites stay isolated on the public demo site.',
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      const user = createTestUser();

      await registerPage.goto();
      await registerPage.register(user);

      await expect(registerPage.successHeading).toBeVisible();
      await page.goto(ROUTES.account);

      if (page.url().includes('route=account/login')) {
        await loginPage.login(user);
      }

      await expect(page).toHaveURL(/route=account\/account/);
      await persistAuthenticatedUser(page, user);
    },
  );
});
