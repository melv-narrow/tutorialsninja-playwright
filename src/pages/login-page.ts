import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';
import type { TestUser } from '../support/test-users.js';

export class LoginPage {
  readonly page: Page;
  readonly returningCustomerHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.returningCustomerHeading = page.getByRole('heading', {
      name: 'Returning Customer',
    });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.login);
  }

  async login(user: TestUser): Promise<void> {
    await this.page.locator('input[name="email"]').fill(user.email);
    await this.page.locator('input[name="password"]').fill(user.password);
    await this.page.locator('input[value="Login"]').click();
  }
}
