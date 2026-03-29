import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class EditAccountPage {
  readonly page: Page;
  readonly telephoneInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.telephoneInput = page.locator('input[name="telephone"]');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.editAccount);
  }

  async updateTelephone(telephone: string): Promise<void> {
    await this.telephoneInput.fill(telephone);
    await this.continueButton.click();
  }
}
