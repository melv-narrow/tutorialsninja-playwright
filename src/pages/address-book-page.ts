import type { Locator, Page } from '@playwright/test';

export class AddressBookPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly continueButton: Locator;
  readonly newAddressLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Address Book Entries' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.newAddressLink = page.getByRole('link', { name: 'New Address' });
  }

  async openNewAddressForm(): Promise<void> {
    await this.newAddressLink.click();
  }

  async createAddress(lastNameSuffix: string): Promise<void> {
    await this.page.locator('input[name="firstname"]').fill('Codex');
    await this.page
      .locator('input[name="lastname"]')
      .fill(`Address${lastNameSuffix}`);
    await this.page
      .locator('input[name="address_1"]')
      .fill(`1 Test Street ${lastNameSuffix}`);
    await this.page.locator('input[name="city"]').fill('Johannesburg');
    await this.page.locator('input[name="postcode"]').fill('2000');
    await this.page
      .locator('select[name="country_id"]')
      .selectOption({ label: 'South Africa' });
    await this.page.locator('select[name="zone_id"]').selectOption({
      label: 'Gauteng',
    });
    await this.continueButton.click();
  }

  addressEntry(lastNameSuffix: string): Locator {
    return this.page
      .locator('#content')
      .getByText(`Codex Address${lastNameSuffix}`, { exact: false });
  }
}
