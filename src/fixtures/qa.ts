import { expect, test as base, type TestInfo } from '@playwright/test';
import {
  applyAllureMetadata,
  formatTaggedTitle,
  type QaAuthTestContext,
  type QaFixtures,
  type QaMetadata,
  type QaTestContext,
} from '../support/allure.js';
import { loadStoredUser } from '../support/auth.js';

type QaBody = (args: QaTestContext, testInfo: TestInfo) => Promise<void>;
type QaAuthBody = (
  args: QaAuthTestContext,
  testInfo: TestInfo,
) => Promise<void>;

export const test = base.extend<QaFixtures>({
  // Playwright fixtures require object destructuring for the fixture bag.
  authUser: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use,
  ) => {
    await use(await loadStoredUser());
  },
});

export const qa = (title: string, metadata: QaMetadata, body: QaBody): void => {
  test(
    formatTaggedTitle(title, metadata.tags),
    async (
      { baseURL, browser, browserName, context, page, request },
      testInfo,
    ) => {
      const fixtures = {
        baseURL,
        browser,
        browserName,
        context,
        page,
        request,
      } as QaTestContext;

      await applyAllureMetadata(metadata, testInfo);
      await body(fixtures, testInfo);
    },
  );
};

export const qaAuth = (
  title: string,
  metadata: QaMetadata,
  body: QaAuthBody,
): void => {
  test(
    formatTaggedTitle(title, metadata.tags),
    async (
      { authUser, baseURL, browser, browserName, context, page, request },
      testInfo,
    ) => {
      const fixtures = {
        authUser,
        baseURL,
        browser,
        browserName,
        context,
        page,
        request,
      } as QaAuthTestContext;

      await applyAllureMetadata(metadata, testInfo);
      await body(fixtures, testInfo);
    },
  );
};

export { expect };
