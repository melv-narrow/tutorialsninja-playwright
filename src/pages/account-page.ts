import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class AccountPage {
  readonly page: Page;
  readonly accountHeading: Locator;
  readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountHeading = page
      .locator('#content h2')
      .filter({ hasText: 'My Account' });
    this.successAlert = page.locator('.alert-success');
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.account);
  }

  async openWishlist(): Promise<void> {
    await this.page.goto(ROUTES.wishlist);
  }

  async openNewsletter(): Promise<void> {
    await this.page.goto(ROUTES.newsletter);
  }

  async openEditAccount(): Promise<void> {
    await this.page.goto(ROUTES.editAccount);
  }

  async logout(): Promise<void> {
    await this.page.goto(ROUTES.account);
    await this.page
      .locator('#column-right')
      .getByRole('link', { name: 'Logout' })
      .click();
  }

  wishlistRow(productName: string): Locator {
    return this.page.locator('.table-responsive tbody tr').filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }
}
