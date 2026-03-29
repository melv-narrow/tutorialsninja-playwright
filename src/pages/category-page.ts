import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class CategoryPage {
  readonly page: Page;
  readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successAlert = page.locator('.alert-success');
  }

  async gotoDesktops(): Promise<void> {
    await this.page.goto(ROUTES.desktops);
  }

  async sortBy(optionLabel: string): Promise<void> {
    await this.page.locator('#input-sort').selectOption({ label: optionLabel });
  }

  productCard(productName: string): Locator {
    return this.page
      .locator('.product-thumb')
      .filter({
        has: this.page.locator('.caption a', { hasText: productName }),
      })
      .first();
  }

  async addToCompare(productName: string): Promise<void> {
    await this.productCard(productName)
      .locator('button[data-original-title="Compare this Product"]')
      .click();
  }

  async addToCart(productName: string): Promise<void> {
    await this.productCard(productName)
      .getByRole('button', { name: 'Add to Cart' })
      .click();
  }

  getVisibleProductNames(): Promise<string[]> {
    return this.page.locator('.product-thumb .caption h4 a').allTextContents();
  }
}
