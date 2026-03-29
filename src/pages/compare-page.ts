import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class ComparePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Product Comparison' });
    this.emptyState = page
      .locator('#content')
      .getByText('You have not chosen any products to compare.');
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.compare);
  }

  productLink(productName: string): Locator {
    return this.page
      .getByRole('link', { name: productName, exact: true })
      .first();
  }

  async removeProduct(_productName: string): Promise<void> {
    await this.page
      .locator('#content a.btn-danger')
      .getByText('Remove')
      .click();
  }
}
