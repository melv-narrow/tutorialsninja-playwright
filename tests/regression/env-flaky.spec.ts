import { Severity } from 'allure-js-commons';
import { expect, qa, test } from '../../src/fixtures/qa.js';
import { HomePage } from '../../src/pages/home-page.js';

test.describe('Environment-sensitive live demo checks', () => {
  qa(
    'switches currency and reflects the new symbol on featured product pricing',
    {
      epic: 'Storefront',
      feature: 'Localization',
      story: 'Visitors can switch display currency on the demo site',
      severity: Severity.MINOR,
      tags: ['@regression', '@env-flaky'],
      description:
        'This runs separately because shared demo-state and CDN timing can make the live currency UI more volatile than core regression flows.',
    },
    async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();
      await homePage.switchCurrency('€Euro');

      await expect(homePage.productCard('MacBook')).toContainText('€');
    },
  );
});
