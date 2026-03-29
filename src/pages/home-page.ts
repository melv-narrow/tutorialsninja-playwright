import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../support/routes.js';

export class HomePage {
  readonly page: Page;
  readonly featuredHeading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.featuredHeading = page.getByRole('heading', { name: 'Featured' });
    this.searchInput = page.locator('input[name="search"]').first();
    this.searchButton = page.locator('#search button');
    this.successAlert = page.locator('.alert-success');
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.home);
  }

  async openMyAccountMenu(): Promise<void> {
    await this.page.locator('a[title="My Account"]').first().click();
  }

  async openRegister(): Promise<void> {
    await this.openMyAccountMenu();
    await this.page.getByRole('link', { name: 'Register' }).first().click();
  }

  async openLogin(): Promise<void> {
    await this.openMyAccountMenu();
    await this.page.getByRole('link', { name: 'Login' }).first().click();
  }

  async openTopCategory(name: string): Promise<void> {
    await this.page
      .locator('#column-left')
      .getByRole('link', { name, exact: true })
      .first()
      .click();
  }

  async searchFor(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
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

  async addFeaturedProductToCart(productName: string): Promise<void> {
    await this.productCard(productName)
      .getByRole('button', { name: 'Add to Cart' })
      .click();
  }

  async addFeaturedProductToWishlist(productName: string): Promise<void> {
    await this.productCard(productName)
      .locator('button[data-original-title="Add to Wish List"]')
      .click();
  }

  async switchCurrency(currencyLabel: string): Promise<void> {
    await this.page
      .locator('form#form-currency button.dropdown-toggle')
      .click();
    await this.page.getByRole('button', { name: currencyLabel }).click();
  }
}
