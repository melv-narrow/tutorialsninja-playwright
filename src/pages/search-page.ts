import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly descriptionCheckbox: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#content input[name="search"]');
    this.searchButton = page.locator('#button-search');
    this.descriptionCheckbox = page.locator('input[name="description"]');
    this.noResultsMessage = page
      .locator('#content')
      .getByText('There is no product that matches the search criteria.');
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.search);
  }

  async search(
    term: string,
    options?: { includeDescription?: boolean },
  ): Promise<void> {
    await this.searchInput.fill(term);

    if (options?.includeDescription) {
      await this.descriptionCheckbox.check();
    }

    await this.searchButton.click();
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
