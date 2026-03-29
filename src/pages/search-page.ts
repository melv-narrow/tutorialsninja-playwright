import type { Locator, Page } from '@playwright/test';

export class SearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  productCard(productName: string): Locator {
    return this.page
      .locator('.product-thumb')
      .filter({
        has: this.page.locator('.caption a', { hasText: productName }),
      })
      .first();
  }
}
