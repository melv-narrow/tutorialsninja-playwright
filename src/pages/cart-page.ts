import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class CartPage {
  readonly page: Page;
  readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successAlert = page.locator('.alert-success');
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.cart);
  }

  cartRow(productName: string): Locator {
    return this.page.locator('.table-responsive tbody tr').filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }

  async updateQuantity(productName: string, quantity: number): Promise<void> {
    const row = this.cartRow(productName);
    await row.locator('input[name*="quantity"]').fill(quantity.toString());
    await row.locator('button[data-original-title="Update"]').click();
  }

  async removeProduct(productName: string): Promise<void> {
    await this.cartRow(productName)
      .locator('button[data-original-title="Remove"]')
      .click();
  }
}
