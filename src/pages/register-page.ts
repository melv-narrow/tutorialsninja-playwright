import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';
import type { TestUser } from '../support/test-users.js';

export class RegisterPage {
  readonly page: Page;
  readonly successHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
    });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.register);
  }

  async register(user: TestUser): Promise<void> {
    await this.page.locator('input[name="firstname"]').fill(user.firstName);
    await this.page.locator('input[name="lastname"]').fill(user.lastName);
    await this.page.locator('input[name="email"]').fill(user.email);
    await this.page.locator('input[name="telephone"]').fill(user.telephone);
    await this.page.locator('input[name="password"]').fill(user.password);
    await this.page.locator('input[name="confirm"]').fill(user.password);
    await this.page.locator('input[name="agree"]').check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
