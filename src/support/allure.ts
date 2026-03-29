import type {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestInfo,
} from '@playwright/test';
import * as allure from 'allure-js-commons';
import type { Severity } from 'allure-js-commons';
import type { TestUser } from './test-users.js';

export type QaMetadata = {
  epic: string;
  feature: string;
  story: string;
  severity: `${Severity}`;
  tags: string[];
  description?: string;
};

export type QaFixtures = {
  authUser: TestUser;
};

export type QaTestContext = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;

export type QaAuthTestContext = QaTestContext & QaFixtures;

const normalizeTag = (tag: string): string => tag.replace(/^@/, '');

export const formatTaggedTitle = (title: string, tags: string[]): string =>
  [title, ...tags.map((tag) => (tag.startsWith('@') ? tag : `@${tag}`))].join(
    ' ',
  );

export const applyAllureMetadata = async (
  metadata: QaMetadata,
  testInfo: TestInfo,
): Promise<void> => {
  await allure.epic(metadata.epic);
  await allure.feature(metadata.feature);
  await allure.story(metadata.story);
  await allure.severity(metadata.severity);

  if (metadata.description) {
    await allure.description(metadata.description);
  }

  for (const tag of metadata.tags) {
    const normalizedTag = normalizeTag(tag);

    await allure.tag(normalizedTag);
    testInfo.annotations.push({
      type: 'tag',
      description: normalizedTag,
    });
  }
};
